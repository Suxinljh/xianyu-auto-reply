<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>商品指定回复</span>
        <div class="header-actions">
          <el-select v-model="currentCid" placeholder="选择账号" style="width: 220px" @change="loadData">
            <el-option v-for="c in cookies" :key="c" :label="c" :value="c" />
          </el-select>
          <el-button :icon="Refresh" :loading="loading" @click="loadData">刷新</el-button>
        </div>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="item_id" label="商品ID" min-width="170" show-overflow-tooltip />
      <el-table-column prop="item_title" label="商品标题" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ row.item_title || row.item_id }}</template>
      </el-table-column>
      <el-table-column prop="reply_content" label="回复内容" min-width="260" show-overflow-tooltip />
      <el-table-column prop="updated_at" label="更新时间" min-width="160" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该商品回复？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!list.length && !loading" description="暂无商品回复数据" />

    <el-dialog v-model="editVisible" title="编辑商品回复" width="540px">
      <el-alert type="info" :closable="false" title="商品ID: {{ current?.item_id }}" style="margin-bottom:12px" />
      <el-form label-width="80px">
        <el-form-item label="回复内容">
          <el-input v-model="replyText" type="textarea" :rows="5" placeholder="该商品的自动回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { listCookies } from '@/api/accounts'
import { getItemRepliesByCookie, updateItemReply, deleteItemReply, type ItemReply } from '@/api/itemReply'

const cookies = ref<string[]>([])
const currentCid = ref('')
const list = ref<ItemReply[]>([])
const loading = ref(false)
const saving = ref(false)
const editVisible = ref(false)
const current = ref<ItemReply | null>(null)
const replyText = ref('')

async function loadCookies() {
  const c = await listCookies()
  cookies.value = c || []
  if (cookies.value.length) { currentCid.value = cookies.value[0]; loadData() }
}

async function loadData() {
  if (!currentCid.value) return
  loading.value = true
  try {
    list.value = await getItemRepliesByCookie(currentCid.value)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载失败')
  } finally {
    loading.value = false
  }
}

function openEdit(row: ItemReply) {
  current.value = row
  replyText.value = row.reply_content || ''
  editVisible.value = true
}

async function save() {
  if (!current.value) return
  if (!replyText.value.trim()) { ElMessage.warning('请输入回复内容'); return }
  saving.value = true
  try {
    await updateItemReply(current.value.cookie_id, current.value.item_id, replyText.value)
    ElMessage.success('已保存')
    editVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: ItemReply) {
  try {
    await deleteItemReply(row.cookie_id, row.item_id)
    ElMessage.success('已删除')
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '删除失败')
  }
}

onMounted(loadCookies)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; gap: 8px; }
</style>
