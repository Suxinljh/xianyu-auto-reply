<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>通知渠道</span>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增渠道</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column label="类型" width="120">
        <template #default="{ row }"><el-tag size="small">{{ channelTypeLabel(row.type) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="配置" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ configSummary(row.config) }}</template>
      </el-table-column>
      <el-table-column label="启用" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v:any) => toggleEnabled(row, v)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该渠道？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑渠道' : '新增渠道'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="渠道名称，如：我的邮箱" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width:100%">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置">
          <el-input v-model="form.config" type="textarea" :rows="5" placeholder='JSON，如 {"webhook_url":"..."}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getNotificationChannels, createNotificationChannel, updateNotificationChannel, deleteNotificationChannel, type NotificationChannel } from '@/api/notifications'

const list = ref<NotificationChannel[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const typeOptions = [
  { value: 'qq', label: 'QQ' },
  { value: 'ding_talk', label: '钉钉' },
  { value: 'feishu', label: '飞书' },
  { value: 'lark', label: '飞书(Lark)' },
  { value: 'bark', label: 'Bark' },
  { value: 'email', label: '邮件' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'wechat', label: '微信' },
  { value: 'telegram', label: 'Telegram' },
]

const form = reactive({ id: 0, name: '', type: 'webhook', config: '' })

const rules: FormRules = {
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

function channelTypeLabel(t: string) {
  const found = typeOptions.find((o) => o.value === t)
  return found ? found.label : t
}

function configSummary(config: any) {
  if (!config) return ''
  try {
    const obj = typeof config === 'string' ? JSON.parse(config) : config
    return JSON.stringify(obj)
  } catch {
    return String(config)
  }
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getNotificationChannels()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载渠道失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  Object.assign(form, { id: 0, name: '', type: 'webhook', config: '' })
  dialogVisible.value = true
}

function openEdit(row: NotificationChannel) {
  isEdit.value = true
  const cfg = typeof row.config === 'string' ? row.config : JSON.stringify(row.config || '')
  Object.assign(form, { id: row.id, name: row.name, type: row.type || 'webhook', config: cfg })
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const configStr = typeof form.config === 'string' ? form.config : JSON.stringify(form.config)
    if (isEdit.value) {
      await updateNotificationChannel(form.id, { name: form.name, config: configStr, enabled: true })
    } else {
      await createNotificationChannel({ name: form.name, type: form.type, config: configStr })
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleEnabled(row: NotificationChannel, v: boolean) {
  try {
    const cfg = typeof row.config === 'string' ? row.config : JSON.stringify(row.config || '')
    await updateNotificationChannel(row.id, { name: row.name, config: cfg, enabled: v })
    row.enabled = v
    ElMessage.success('已更新')
  } catch (e) { ElMessage.error('操作失败') }
}

async function handleDelete(row: NotificationChannel) {
  try {
    await deleteNotificationChannel(row.id)
    ElMessage.success('已删除')
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '删除失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
