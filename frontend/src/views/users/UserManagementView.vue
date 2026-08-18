<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>用户管理（仅管理员）</span>
        <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" min-width="140" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column prop="cookie_count" label="账号数" width="90" />
      <el-table-column prop="card_count" label="卡券数" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'info'" size="small">{{ row.is_active ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定删除该用户？此操作会删除其所有数据！" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getAdminUsers, deleteAdminUser, type AdminUser } from '@/api/admin'

const list = ref<AdminUser[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = await getAdminUsers()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载用户失败')
    if (e?.response?.status === 403) ElMessage.warning('仅管理员可访问')
  } finally {
    loading.value = false
  }
}

async function handleDelete(row: AdminUser) {
  try {
    await deleteAdminUser(row.id)
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
