<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>关键词 / 自动回复</span>
        <el-select v-model="currentCid" placeholder="选择账号" style="width: 240px" @change="loadAll">
          <el-option v-for="c in cookies" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </template>

    <template v-if="currentCid">
      <!-- 默认回复设置 -->
      <el-card shadow="never" class="sub-card">
        <template #header>默认回复设置</template>
        <el-form label-width="110px">
          <el-form-item label="启用默认回复">
            <el-switch v-model="defaultReply.enabled" />
          </el-form-item>
          <el-form-item label="一次性回复">
            <el-switch v-model="defaultReply.reply_once" />
          </el-form-item>
          <el-form-item label="回复内容">
            <el-input v-model="defaultReply.reply_content" type="textarea" :rows="3" placeholder="默认回复内容，可用占位符" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="savingDefault" @click="saveDefaultReply">保存默认回复</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 关键词列表 -->
      <el-card shadow="never" class="sub-card">
        <template #header>
          <div class="card-header">
            <span>关键词列表 ({{ keywords.length }})</span>
            <el-button type="primary" :icon="Plus" @click="openAdd">新增关键词</el-button>
          </div>
        </template>

        <el-table :data="keywords" v-loading="loadingKw" border stripe>
          <el-table-column prop="keyword" label="关键词" min-width="180" />
          <el-table-column prop="reply" label="回复内容" min-width="260" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="90">
            <template #default="{ row }"><el-tag size="small">{{ row.type === 'image' ? '图片' : (row.type === 'item' ? '商品' : '文本') }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row, $index }">
              <el-popconfirm title="确定删除该关键词？" @confirm="handleDelete($index)">
                <template #reference><el-button link type="danger">删除</el-button></template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 新增关键词对话框 -->
    <el-dialog v-model="addVisible" title="新增关键词" width="500px">
      <el-form label-width="80px">
        <el-form-item label="关键词">
          <el-input v-model="newKw.keyword" placeholder="触发词，如：发货" />
        </el-form-item>
        <el-form-item label="回复内容">
          <el-input v-model="newKw.reply" type="textarea" :rows="3" placeholder="回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">添加</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { listCookies } from '@/api/accounts'
import { getKeywords, updateKeywords, deleteKeyword, getDefaultReply, updateDefaultReply, type Keyword } from '@/api/keywords'

const cookies = ref<string[]>([])
const currentCid = ref('')
const keywords = ref<Keyword[]>([])
const loadingKw = ref(false)
const savingDefault = ref(false)

const defaultReply = reactive({ enabled: false, reply_once: false, reply_content: '' })

const addVisible = ref(false)
const newKw = reactive({ keyword: '', reply: '' })

async function loadCookies() {
  const c = await listCookies()
  cookies.value = c || []
  if (cookies.value.length) {
    currentCid.value = cookies.value[0]
    loadAll()
  }
}

async function loadAll() {
  if (!currentCid.value) return
  loadKeywords()
  loadDefaultReply()
}

async function loadKeywords() {
  if (!currentCid.value) return
  loadingKw.value = true
  try {
    const list = await getKeywords(currentCid.value)
    keywords.value = list.map((k, i) => ({ ...k, _index: i }))
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载关键词失败')
  } finally {
    loadingKw.value = false
  }
}

async function loadDefaultReply() {
  try {
    const d = await getDefaultReply(currentCid.value)
    Object.assign(defaultReply, { enabled: !!d.enabled, reply_once: !!d.reply_once, reply_content: d.reply_content || '' })
  } catch (e) { /* ignore */ }
}

// 提交全部关键词（后端是整体替换）
async function pushKeywords(list: Keyword[]) {
  await updateKeywords(currentCid.value, Object.fromEntries(list.map((k) => [k.keyword, k.reply])))
}

function openAdd() {
  Object.assign(newKw, { keyword: '', reply: '' })
  addVisible.value = true
}

async function handleAdd() {
  if (!newKw.keyword) { ElMessage.warning('请输入关键词'); return }
  const next = [...keywords.value, { keyword: newKw.keyword, reply: newKw.reply, type: 'normal' }]
  try {
    await pushKeywords(next)
    ElMessage.success('已添加')
    addVisible.value = false
    loadKeywords()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '添加失败')
  }
}

async function handleDelete(index: number) {
  try {
    // 后端支持按索引删除
    await deleteKeyword(currentCid.value, index)
    ElMessage.success('已删除')
    loadKeywords()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '删除失败')
  }
}

async function saveDefaultReply() {
  savingDefault.value = true
  try {
    await updateDefaultReply(currentCid.value, {
      enabled: defaultReply.enabled, reply_once: defaultReply.reply_once, reply_content: defaultReply.reply_content,
    })
    ElMessage.success('默认回复已保存')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '保存失败')
  } finally {
    savingDefault.value = false
  }
}

onMounted(loadCookies)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.sub-card { margin-bottom: 16px; }
</style>
