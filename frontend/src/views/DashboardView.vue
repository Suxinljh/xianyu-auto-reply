<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.total_accounts ?? accounts }}</div>
          <div class="stat-label">账号总数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.total_items ?? items }}</div>
          <div class="stat-label">商品数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.total_orders ?? orders }}</div>
          <div class="stat-label">订单数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.total_keywords ?? keywords }}</div>
          <div class="stat-label">关键词</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="never" class="welcome-card">
      <div class="welcome-title">欢迎回来，{{ auth.username }}</div>
      <div class="welcome-desc">闲鱼自动回复系统已就绪。可在「账号管理」中添加账号并配置自动回复。</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getAdminStats } from '@/api/dashboard'
import { listCookies } from '@/api/accounts'

const auth = useAuthStore()
const stats = ref<any>({})
const accounts = ref(0)
const items = ref(0)
const orders = ref(0)
const keywords = ref(0)

async function load() {
  try {
    // 管理员可获取系统统计；普通用户至少可获取自己的账号数
    const st = await getAdminStats()
    stats.value = st || {}
  } catch (e) {
    // 非管理员或失败时回退到账号数
    try {
      const c = await listCookies()
      accounts.value = (c || []).length
    } catch (e2) { /* ignore */ }
  }
}

onMounted(load)
</script>

<style scoped>
.stat-card { text-align: center; }
.stat-value { font-size: 32px; font-weight: 600; color: var(--el-color-primary); }
.stat-label { margin-top: 8px; color: #909399; font-size: 14px; }
.welcome-card { margin-top: 16px; }
.welcome-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.welcome-desc { color: #909399; }
</style>
