<template>
  <div class="login-wrap" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="login-overlay"></div>
    <el-card class="login-card">
      <div class="login-title">闲鱼自动回复系统</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名 / 邮箱" prop="account">
          <el-input v-model="form.account" placeholder="请输入用户名或邮箱" size="large" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
      <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" class="error-alert" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import bgImage from '@/assets/background.webp'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  account: '',
  password: ''
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  errorMsg.value = ''
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    // 判断输入的是邮箱还是用户名（粗略：含 @ 视为邮箱）
    const isEmail = form.account.includes('@')
    const params = isEmail
      ? { email: form.account, password: form.password }
      : { username: form.account, password: form.password }
    const ok = await auth.login(params)
    if (ok) {
      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/dashboard'
      router.push(redirect)
    } else {
      errorMsg.value = '用户名或密码错误'
    }
  } catch (e: any) {
    errorMsg.value = (e?.response?.data?.detail as string) || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  height: 100vh;
  /* 背景图片平铺，不渐变不阴影 */
  background-size: cover; background-position: center; background-repeat: no-repeat;
}

/* 可选：背景上覆一层轻微压暗，保证内容可读（纯色，无渐变） */
.login-overlay {
  position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.15);
}

.login-card {
  position: relative;
  width: 400px;
  border-radius: 12px;
  padding: 8px 8px 16px;
  /* 半透明 + 背景模糊 + 无投影 */
  background: rgba(255, 255, 255, 0.72) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: none !important;
}
.login-title { text-align: center; font-size: 22px; font-weight: 600; margin: 8px 0 24px; color: #303133; }
.login-btn { width: 100%; margin-top: 8px; }
.error-alert { margin-top: 12px; }
</style>
