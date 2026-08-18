<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>AI 回复设置</span>
        <el-select v-model="currentCid" placeholder="选择账号" style="width: 240px" @change="loadSettings">
          <el-option v-for="c in cookies" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </template>

    <template v-if="currentCid">
      <el-alert type="info" :closable="false" show-icon style="margin-bottom:16px"
        title="配置每个账号的 AI 自动回复。开启后，闲鱼消息将使用 AI 生成回复。" />
      <el-form ref="formRef" :model="form" label-width="180px">
        <el-form-item label="启用 AI 回复">
          <el-switch v-model="form.ai_enabled" />
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input v-model="form.model_name" placeholder="如 qwen-plus / gpt-4o-mini" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="form.api_key" type="password" show-password placeholder="AI 服务 API Key（仅保存不展示）" />
        </el-form-item>
        <el-form-item label="API 地址 (Base URL)">
          <el-input v-model="form.base_url" placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
        </el-form-item>
        <el-form-item label="最大折扣百分比">
          <el-input-number v-model="form.max_discount_percent" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="最大折扣金额(元)">
          <el-input-number v-model="form.max_discount_amount" :min="0" />
        </el-form-item>
        <el-form-item label="最大议价轮数">
          <el-input-number v-model="form.max_bargain_rounds" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="自定义提示词">
          <el-input v-model="form.custom_prompts" type="textarea" :rows="4" placeholder="可选的自定义 AI 提示词" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
          <el-button :loading="testing" @click="openTest">测试回复</el-button>
        </el-form-item>
      </el-form>
    </template>
    <el-empty v-else description="请先添加并选择账号" />
  </el-card>

  <el-dialog v-model="testVisible" title="测试 AI 回复" width="520px">
    <el-form label-width="80px">
      <el-form-item label="买家消息">
        <el-input v-model="testMsg" type="textarea" :rows="3" placeholder="输入模拟的买家消息" />
      </el-form-item>
      <el-form-item label="AI 回复">
        <el-input v-model="testResult" type="textarea" :rows="4" readonly placeholder="测试结果" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="testVisible = false">关闭</el-button>
      <el-button type="primary" :loading="testing" @click="runTest">发起测试</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listCookies } from '@/api/accounts'
import { getAIReplySettings, updateAIReplySettings, testAIReply } from '@/api/ai'

const cookies = ref<string[]>([])
const currentCid = ref('')
const saving = ref(false)
const testing = ref(false)
const testVisible = ref(false)
const testMsg = ref('')
const testResult = ref('')

const form = reactive({
  ai_enabled: false,
  model_name: 'qwen-plus',
  api_key: '',
  base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  max_discount_percent: 10,
  max_discount_amount: 100,
  max_bargain_rounds: 3,
  custom_prompts: '',
})

async function loadCookies() {
  const c = await listCookies()
  cookies.value = c || []
  if (cookies.value.length) {
    currentCid.value = cookies.value[0]
    loadSettings()
  }
}

async function loadSettings() {
  if (!currentCid.value) return
  try {
    const s = await getAIReplySettings(currentCid.value)
    Object.assign(form, {
      ai_enabled: !!s.ai_enabled,
      model_name: s.model_name || 'qwen-plus',
      api_key: s.api_key || '',
      base_url: s.base_url || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      max_discount_percent: s.max_discount_percent ?? 10,
      max_discount_amount: s.max_discount_amount ?? 100,
      max_bargain_rounds: s.max_bargain_rounds ?? 3,
      custom_prompts: s.custom_prompts || '',
    })
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载设置失败')
  }
}

async function save() {
  if (!currentCid.value) return
  saving.value = true
  try {
    await updateAIReplySettings(currentCid.value, { ...form })
    ElMessage.success('保存成功')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    saving.value = false
  }
}

function openTest() {
  testVisible.value = true
  testMsg.value = ''
  testResult.value = ''
}

async function runTest() {
  if (!currentCid.value || !testMsg.value) { ElMessage.warning('请输入测试消息'); return }
  testing.value = true
  try {
    const res = await testAIReply(currentCid.value, { message: testMsg.value })
    testResult.value = res?.reply || res?.message || JSON.stringify(res)
  } catch (e: any) {
    testResult.value = e?.response?.data?.detail || '测试失败'
  } finally {
    testing.value = false
  }
}

onMounted(loadCookies)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
