<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>自动发货规则</span>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增规则</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="keyword" label="关键字" min-width="160" />
      <el-table-column prop="card_name" label="卡券" min-width="160">
        <template #default="{ row }">{{ row.card_name || ('卡券#' + row.card_id) }}</template>
      </el-table-column>
      <el-table-column prop="delivery_count" label="发货数量" width="100" />
      <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
      <el-table-column prop="delivery_times" label="发货次数" width="100" />
      <el-table-column label="启用" width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v:any) => toggleEnabled(row, v)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该规则？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="form.keyword" placeholder="如：发货" />
        </el-form-item>
        <el-form-item label="卡券" prop="card_id">
          <el-select v-model="form.card_id" placeholder="选择卡券" style="width:100%">
            <el-option v-for="c in cards" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发货数量" prop="delivery_count">
          <el-input-number v-model="form.delivery_count" :min="1" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="可选" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
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
import {
  getDeliveryRules, createDeliveryRule, updateDeliveryRule, deleteDeliveryRule, type DeliveryRule
} from '@/api/delivery'
import { getCards, type Card } from '@/api/cards'

const list = ref<DeliveryRule[]>([])
const cards = ref<Card[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({ id: 0, keyword: '', card_id: 0 as any, delivery_count: 1, description: '', enabled: true })

const rules: FormRules = {
  keyword: [{ required: true, message: '请输入关键字', trigger: 'blur' }],
  card_id: [{ required: true, message: '请选择卡券', trigger: 'change' }]
}

async function loadData() {
  loading.value = true
  try {
    const [ruleData, cardData] = await Promise.all([getDeliveryRules(), getCards()])
    list.value = ruleData
    cards.value = cardData
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  Object.assign(form, { id: 0, keyword: '', card_id: 0, delivery_count: 1, description: '', enabled: true })
  dialogVisible.value = true
}

function openEdit(row: DeliveryRule) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id, keyword: row.keyword, card_id: row.card_id,
    delivery_count: row.delivery_count, description: row.description || '', enabled: !!row.enabled,
  })
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  const payload = {
    keyword: form.keyword, card_id: form.card_id,
    delivery_count: form.delivery_count, description: form.description, enabled: form.enabled,
  }
  try {
    if (isEdit.value) {
      await updateDeliveryRule(form.id, payload)
    } else {
      await createDeliveryRule(payload)
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

async function toggleEnabled(row: DeliveryRule, v: boolean) {
  try {
    await updateDeliveryRule(row.id, {
      keyword: row.keyword, card_id: row.card_id,
      delivery_count: row.delivery_count, description: row.description, enabled: v,
    })
    row.enabled = v
    ElMessage.success('已更新')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(row: DeliveryRule) {
  try {
    await deleteDeliveryRule(row.id)
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
