<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>风险控制日志（仅管理员）</span>
        <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="cookie_id" label="账号ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="event_type" label="事件类型" min-width="140" />
      <el-table-column prop="event_description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="processing_status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.processing_status)" size="small">{{ row.processing_status || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="时间" min-width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定删除该日志？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="total > pageSize" :total="total" :page-size="pageSize" :current-page="page" layout="prev, pager, next" @current-change="onPageChange" style="margin-top:12px" />
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getRiskLogs, deleteRiskLog, type RiskLog } from '@/api/risk'

const list = ref<RiskLog[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 50

async function load() {
  loading.value = true
  try {
    const res = await getRiskLogs({ limit: pageSize, offset: (page.value - 1) * pageSize })
    list.value = res.data
    total.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载日志失败')
  } finally {
    loading.value = false
  }
}

function onPageChange(p: number) { page.value = p; load() }

function statusTag(s?: string) {
  return s === 'success' ? 'success' : s === 'failed' ? 'danger' : s === 'processing' ? 'warning' : 'info'
}

async function handleDelete(row: RiskLog) {
  if (row.id == null) return
  try {
    await deleteRiskLog(row.id)
    ElMessage.success('已删除')
    load()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '删除失败')
  }
}

onMounted(load)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
