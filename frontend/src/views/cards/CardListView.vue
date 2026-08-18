<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>卡券管理</span>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增卡券</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
      <el-table-column prop="delay_seconds" label="延时(秒)" width="100" />
      <el-table-column prop="is_multi_spec" label="多规格" width="90">
        <template #default="{ row }">{{ row.is_multi_spec ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="启用" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v:any) => toggleEnabled(row, v)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该卡券？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑卡券' : '新增卡券'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="卡券名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="文本" value="text" />
            <el-option label="数据" value="data" />
            <el-option label="图片" value="image" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'text'" label="文本内容">
          <el-input v-model="form.text_content" type="textarea" :rows="3" placeholder="回复的文本内容" />
        </el-form-item>
        <el-form-item v-if="form.type === 'data'" label="数据内容">
          <el-input v-model="form.data_content" type="textarea" :rows="3" placeholder="发货的数据内容" />
        </el-form-item>
        <el-form-item v-if="form.type === 'api'" label="API配置">
          <el-input v-model="form.api_config_str" type="textarea" :rows="3" placeholder='JSON，如 {"url":"..."}' />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="可选" />
        </el-form-item>
        <el-form-item label="延时(秒)">
          <el-input-number v-model="form.delay_seconds" :min="0" />
        </el-form-item>
        <el-form-item label="多规格">
          <el-switch v-model="form.is_multi_spec" />
        </el-form-item>
        <template v-if="form.is_multi_spec">
          <el-form-item label="规格名">
            <el-input v-model="form.spec_name" placeholder="如：规格" />
          </el-form-item>
          <el-form-item label="规格值">
            <el-input v-model="form.spec_value" placeholder="如：默认" />
          </el-form-item>
        </template>
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
import { getCards, createCard, updateCard, deleteCard, type Card } from '@/api/cards'

const list = ref<Card[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0, name: '', type: 'text', text_content: '', data_content: '', api_config_str: '',
  description: '', delay_seconds: 0, enabled: true, is_multi_spec: false, spec_name: '', spec_value: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入卡券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

function parseApiConfig(s: string): any {
  try { return s ? JSON.parse(s) : undefined } catch { return s }
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getCards()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载卡券失败')
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(form, { id: 0, name: '', type: 'text', text_content: '', data_content: '', api_config_str: '',
    description: '', delay_seconds: 0, enabled: true, is_multi_spec: false, spec_name: '', spec_value: '' })
}

function openCreate() {
  isEdit.value = false
  reset()
  dialogVisible.value = true
}

function openEdit(row: Card) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id, name: row.name, type: row.type || 'text',
    text_content: row.text_content || '', data_content: row.data_content || '',
    api_config_str: typeof row.api_config === 'string' ? row.api_config : JSON.stringify(row.api_config || ''),
    description: row.description || '', delay_seconds: row.delay_seconds || 0,
    enabled: !!(row.enabled ?? true), is_multi_spec: !!row.is_multi_spec,
    spec_name: row.spec_name || '', spec_value: row.spec_value || '',
  })
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  const payload: Partial<Card> = {
    name: form.name, type: form.type, description: form.description,
    delay_seconds: form.delay_seconds, enabled: form.enabled,
    is_multi_spec: form.is_multi_spec, spec_name: form.is_multi_spec ? form.spec_name : undefined,
    spec_value: form.is_multi_spec ? form.spec_value : undefined,
  }
  if (form.type === 'text') payload.text_content = form.text_content
  if (form.type === 'data') payload.data_content = form.data_content
  if (form.type === 'api') payload.api_config = parseApiConfig(form.api_config_str)
  try {
    if (isEdit.value) {
      await updateCard(form.id, payload)
    } else {
      await createCard(payload)
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

async function toggleEnabled(row: Card, v: boolean) {
  try {
    await updateCard(row.id, { enabled: v })
    row.enabled = v
    ElMessage.success('已更新')
  } catch (e) { ElMessage.error('操作失败') }
}

async function handleDelete(row: Card) {
  try {
    await deleteCard(row.id)
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
