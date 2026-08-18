<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>消息通知配置</span>
        <el-select v-model="currentCid" placeholder="选择账号" style="width: 220px" @change="loadData">
          <el-option v-for="c in cookies" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </template>

    <template v-if="currentCid">
      <el-alert type="info" :closable="false" show-icon style="margin-bottom:16px"
        title="为该账号绑定通知渠道，事件发生时将通过已启用渠道推送消息。" />

      <el-form :inline="true" class="add-form">
        <el-form-item label="通知渠道">
          <el-select v-model="newChannelId" placeholder="选择渠道" style="width: 220px">
            <el-option v-for="ch in channels" :key="ch.id" :label="ch.name" :value="ch.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="adding" @click="handleAdd">绑定渠道</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="channel_name" label="渠道名称" min-width="160" />
        <el-table-column prop="channel_type" label="类型" width="130" />
        <el-table-column label="启用" width="100">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" @change="(v:any) => toggle(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDelete(row)">解绑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!list.length && !loading" description="该账号尚未绑定通知渠道" />
    </template>
    <el-empty v-else description="请先选择账号" />
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listCookies } from '@/api/accounts'
import { getNotificationChannels, type NotificationChannel } from '@/api/notifications'
import { getAccountNotifications, setMessageNotification, deleteMessageNotification, type MessageNotification } from '@/api/msgNotifications'

const cookies = ref<string[]>([])
const currentCid = ref('')
const channels = ref<NotificationChannel[]>([])
const list = ref<MessageNotification[]>([])
const loading = ref(false)
const adding = ref(false)
const newChannelId = ref<number | null>(null)

async function loadCookies() {
  try { cookies.value = (await listCookies()) || [] } catch (e) {}
  try { channels.value = await getNotificationChannels() } catch (e) {}
  if (cookies.value.length) { currentCid.value = cookies.value[0]; loadData() }
}

async function loadData() {
  if (!currentCid.value) return
  loading.value = true
  try {
    list.value = await getAccountNotifications(currentCid.value)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载失败')
  } finally { loading.value = false }
}

async function handleAdd() {
  if (!currentCid.value || newChannelId.value == null) { ElMessage.warning('请选择渠道'); return }
  adding.value = true
  try {
    await setMessageNotification(currentCid.value, { channel_id: newChannelId.value, enabled: true })
    ElMessage.success('已绑定'); newChannelId.value = null; loadData()
  } catch (e: any) { ElMessage.error(e?.response?.data?.detail || '绑定失败') } finally { adding.value = false }
}

async function toggle(row: MessageNotification, v: boolean) {
  try {
    await setMessageNotification(row.cookie_id || currentCid.value, { channel_id: row.channel_id, enabled: v })
    row.enabled = v; ElMessage.success('已更新')
  } catch (e) { ElMessage.error('操作失败') }
}

async function handleDelete(row: MessageNotification) {
  try {
    await deleteMessageNotification(row.id)
    ElMessage.success('已解绑'); loadData()
  } catch (e: any) { ElMessage.error(e?.response?.data?.detail || '解绑失败') }
}

onMounted(loadCookies)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.add-form { margin-bottom: 12px; }
</style>
