<template>
  <div>
  <el-card shadow="never" class="about-card">
    <div class="about-title">闲鱼自动回复管理系统</div>
    <div class="about-desc">企业级多用户版本的闲鱼自动回复与自动发货系统，前后端分离重构版（Vue 3 + Element Plus）。</div>
    <el-descriptions :column="1" border class="about-info">
      <el-descriptions-item label="前端版本">v1.0.0</el-descriptions-item>
      <el-descriptions-item label="接口方式">REST API + Bearer Token</el-descriptions-item>
      <el-descriptions-item label="当前用户">{{ auth.username }}</el-descriptions-item>
      <el-descriptions-item label="权限">{{ auth.isAdmin ? '管理员' : '普通用户' }}</el-descriptions-item>
    </el-descriptions>
  </el-card>

  <el-card shadow="never" class="about-card">
    <template #header>功能特性</template>
    <div class="feature-grid">
      <div v-for="f in features" :key="f" class="feature-item"><el-icon><CircleCheck /></el-icon>{{ f }}</div>
    </div>
  </el-card>

  <el-card shadow="never" class="about-card">
    <template #header>技术栈</template>
    <el-tag v-for="t in techs" :key="t" style="margin-right:8px;margin-bottom:8px">{{ t }}</el-tag>
  </el-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const features = ['多用户多账号管理', '关键词自动回复', 'AI 智能回复', '默认回复与一次性回复', '卡券管理', '自动发货', '自动确认发货', '多渠道通知', '数据备份恢复', '日志查看']
const techs = ['Vue 3', 'TypeScript', 'Element Plus', 'Vite', 'Pinia', 'Vue Router', 'Axios', 'FastAPI', 'SQLite']
</script>

<style scoped>
.about-card { margin-bottom: 16px; }
.about-title { font-size: 24px; font-weight: 600; color: var(--el-color-primary); margin-bottom: 8px; }
.about-desc { color: #606266; margin-bottom: 16px; }
.about-info { max-width: 480px; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.feature-item { display: flex; align-items: center; gap: 6px; color: #303133; }
</style>
