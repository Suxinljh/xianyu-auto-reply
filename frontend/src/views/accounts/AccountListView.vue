<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>账号管理</span>
        <el-button type="primary" :icon="Plus" @click="openAdd">新增账号</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="账号ID" min-width="160" />
      <el-table-column prop="remark" label="备注" min-width="140" />
      <el-table-column label="启用状态" width="110">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" @change="(v:any) => toggleStatus(row, v)" />
        </template>
      </el-table-column>
      <el-table-column label="自动确认" width="110">
        <template #default="{ row }">
          <el-switch :model-value="row.auto_confirm" @change="(v:any) => toggleAutoConfirm(row, v)" />
        </template>
      </el-table-column>
      <el-table-column prop="pause_duration" label="暂停(秒)" width="100" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="openRemark(row)">备注</el-button>
          <el-popconfirm title="确定删除该账号？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑账号对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="账号ID" prop="id">
          <el-input v-model="form.id" :disabled="isEdit" placeholder="唯一标识，如 my_account" />
        </el-form-item>
        <el-form-item label="Cookie" prop="value">
          <el-input v-model="form.value" type="textarea" :rows="4" placeholder="粘贴 Cookies 字符串" />
        </el-form-item>
        <el-form-item label="登录用户名">
          <el-input v-model="form.username" placeholder="可选" />
        </el-form-item>
        <el-form-item label="登录密码">
          <el-input v-model="form.password" type="password" show-password placeholder="可选" />
        </el-form-item>
        <el-form-item label="显示浏览器">
          <el-switch v-model="form.show_browser" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 备注对话框 -->
    <el-dialog v-model="remarkVisible" title="修改备注" width="420px">
      <el-input v-model="remarkText" placeholder="请输入备注" />
      <template #footer>
        <el-button @click="remarkVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRemark">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  listCookieDetails, addCookie, updateCookieValue, updateCookieAccountInfo, getCookieDetails,
  setCookieStatus, setAutoConfirm, setCookieRemark, setPauseDuration, deleteCookie
} from '@/api/accounts'

const list = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)

const dialogVisible = ref(false)
const remarkVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新增账号')
const remarkText = ref('')
let remarkTargetId = ''

const formRef = ref<FormInstance>()
const form = reactive({ id: '', value: '', username: '', password: '', show_browser: false })

const formRules: FormRules = {
  id: [{ required: true, message: '请输入账号ID', trigger: 'blur' }],
  value: [{ required: true, message: '请输入Cookie', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    const data = await listCookieDetails()
    list.value = data.map((c: any) => ({ ...c, enabled: !!c.enabled, auto_confirm: !!c.auto_confirm }))
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载账号失败')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  isEdit.value = false
  dialogTitle.value = '新增账号'
  Object.assign(form, { id: '', value: '', username: '', password: '', show_browser: false })
  dialogVisible.value = true
}

async function openEdit(row: any) {
  isEdit.value = true
  dialogTitle.value = '编辑账号'
  Object.assign(form, { id: row.id, value: row.value, username: '', password: '', show_browser: row.show_browser || false })
  // 加载账号详情（含用户名/密码/显示浏览器）
  try {
    const detail = await getCookieDetails(row.id)
    form.username = detail.username || ''
    form.password = detail.password || ''
    form.show_browser = !!detail.show_browser
  } catch (e) { /* ignore */ }
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isEdit.value) {
      await updateCookieValue(form.id, form.value)
      // 可选更新账号信息
      if (form.show_browser) {
        await setPauseDuration(form.id, 0) // no-op 占位
      }
    } else {
      await addCookie({ id: form.id, value: form.value })
      if (form.username || form.password) {
        await updateCookieAccountInfo(form.id, { username: form.username, password: form.password })
      }
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row: any, v: boolean) {
  try {
    await setCookieStatus(row.id, v)
    row.enabled = v
    ElMessage.success(v ? '已启用' : '已停用')
  } catch (e: any) {
    ElMessage.error('操作失败')
  }
}

async function toggleAutoConfirm(row: any, v: boolean) {
  try {
    await setAutoConfirm(row.id, v)
    row.auto_confirm = v
    ElMessage.success('已更新')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

function openRemark(row: any) {
  remarkTargetId = row.id
  remarkText.value = row.remark || ''
  remarkVisible.value = true
}

async function saveRemark() {
  try {
    await setCookieRemark(remarkTargetId, remarkText.value)
    remarkVisible.value = false
    ElMessage.success('备注已更新')
    loadList()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

async function handleDelete(row: any) {
  try {
    await deleteCookie(row.id)
    ElMessage.success('已删除')
    loadList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '删除失败')
  }
}

onMounted(loadList)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
