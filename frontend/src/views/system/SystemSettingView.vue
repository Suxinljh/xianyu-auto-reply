<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>系统设置（仅管理员）</span>
        <el-button type="primary" :icon="Plus" @click="openAdd">新增设置项</el-button>
      </div>
    </template>

    <el-table :data="entries" v-loading="loading" border stripe>
      <el-table-column prop="key" label="配置项" min-width="200" />
      <el-table-column prop="description" label="说明" min-width="180" />
      <el-table-column prop="value" label="值" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑设置' : '新增设置'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="配置项" prop="key">
          <el-input v-model="form.key" :disabled="isEdit" placeholder="如 theme_color" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" placeholder="可选" />
        </el-form-item>
        <el-form-item label="值" prop="value">
          <el-input v-model="form.value" type="textarea" :rows="3" placeholder="设置值" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getSystemSettings, updateSystemSetting } from '@/api/system'

const settings = ref<Record<string, string>>({})
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({ key: '', value: '', description: '' })

const rules: FormRules = {
  key: [{ required: true, message: '请输入配置项', trigger: 'blur' }],
  value: [{ required: true, message: '请输入值', trigger: 'blur' }]
}

const entries = computed(() => Object.entries(settings.value).map(([key, value]) => ({ key, value })))

async function loadData() {
  loading.value = true
  try {
    settings.value = await getSystemSettings()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载设置失败');
    if (e?.response?.status === 403) ElMessage.warning('仅管理员可访问')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  isEdit.value = false
  Object.assign(form, { key: '', value: '', description: '' })
  dialogVisible.value = true
}

function openEdit(row: any) {
  isEdit.value = true
  Object.assign(form, { key: row.key, value: row.value, description: row.description || '' })
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await updateSystemSetting(form.key, form.value, form.description || undefined)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
