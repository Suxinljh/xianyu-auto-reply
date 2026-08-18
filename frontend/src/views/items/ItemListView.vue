<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>商品管理</span>
        <div class="header-actions">
          <el-input v-model="keyword" placeholder="搜索关键字" clearable style="width: 220px" @keyup.enter="loadData" />
          <el-button type="primary" :icon="Search" @click="loadData">搜索</el-button>
          <el-popconfirm title="确定批量删除选中商品？" @confirm="batchDelete">
            <template #reference>
              <el-button type="danger" :disabled="!selected.length">批量删除 ({{ selected.length }})</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </template>

    <el-table :data="filteredList" v-loading="loading" border stripe @selection-change="onSelection">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="item_id" label="商品ID" min-width="150" show-overflow-tooltip />
      <el-table-column prop="cookie_id" label="账号ID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="item_title" label="商品标题" min-width="220" show-overflow-tooltip />
      <el-table-column prop="item_price" label="价格" width="100" />
      <el-table-column prop="item_category" label="分类" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">详情/编辑</el-button>
          <el-popconfirm title="确定删除该商品？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editVisible" title="商品详情" width="640px">
      <el-descriptions :column="2" border v-if="current">
        <el-descriptions-item label="商品ID">{{ current.item_id }}</el-descriptions-item>
        <el-descriptions-item label="账号ID">{{ current.cookie_id }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ current.item_title }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{ current.item_price }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ current.item_category }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-position="top" style="margin-top:16px" v-if="current">
        <el-form-item label="商品详情 (JSON/文本)">
          <el-input v-model="detailText" type="textarea" :rows="8" placeholder="商品详情内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDetail">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getAllItems, updateItemDetail, deleteItem, batchDeleteItems, type ItemInfo } from '@/api/items'

const list = ref<ItemInfo[]>([])
const keyword = ref('')
const loading = ref(false)
const saving = ref(false)
const selected = ref<ItemInfo[]>([])
const editVisible = ref(false)
const current = ref<ItemInfo | null>(null)
const detailText = ref('')

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((it) =>
    (it.item_id || '').toLowerCase().includes(k) ||
    (it.item_title || '').toLowerCase().includes(k) ||
    (it.cookie_id || '').toLowerCase().includes(k)
  )
})

async function loadData() {
  loading.value = true
  try {
    list.value = await getAllItems()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载商品失败')
  } finally {
    loading.value = false
  }
}

function onSelection(rows: ItemInfo[]) { selected.value = rows }

function openEdit(row: ItemInfo) {
  current.value = { ...row }
  // 优先用解析后的详情，否则用原始字符串
  const parsed = row.item_detail_parsed
  detailText.value = typeof parsed === 'string' ? parsed : (parsed ? JSON.stringify(parsed, null, 2) : (row.item_detail || ''))
  editVisible.value = true
}

async function saveDetail() {
  if (!current.value) return
  saving.value = true
  try {
    await updateItemDetail(current.value.cookie_id, current.value.item_id, detailText.value)
    ElMessage.success('已保存')
    editVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: ItemInfo) {
  try {
    await deleteItem(row.cookie_id, row.item_id)
    ElMessage.success('已删除')
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '删除失败')
  }
}

async function batchDelete() {
  if (!selected.value.length) return
  const items = selected.value.map((s) => ({ cookie_id: s.cookie_id, item_id: s.item_id }))
  try {
    const res = await batchDeleteItems(items)
    ElMessage.success(`已删除 ${res.success_count}/${res.total_count}`)
    loadData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '批量删除失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-actions { display: flex; gap: 8px; }
</style>
