<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>闲鱼商品搜索</span>
        <div class="search-bar">
          <el-input v-model="keyword" placeholder="输入关键词搜索闲鱼商品" clearable style="width: 280px" @keyup.enter="doSearch" />
          <el-button type="primary" :icon="Search" :loading="loading" @click="doSearch">搜索</el-button>
        </div>
      </div>
    </template>

    <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" style="margin-bottom:12px" />

    <div v-if="items.length" class="results">
      <el-pagination :total="total" :page-size="pageSize" :current-page="page" layout="prev, pager, next, total" @current-change="onPageChange" style="margin-bottom:16px" />
      <div class="item-grid">
        <el-card v-for="it in items" :key="it.item_id" shadow="never" class="item-card">
          <div class="item-img-wrap">
            <img v-if="it.main_image" :src="it.main_image" class="item-img" alt="商品图" />
            <div v-else class="item-img item-img-placeholder">无图</div>
          </div>
          <div class="item-title" :title="it.title">{{ it.title }}</div>
          <div class="item-price">¥{{ it.price }}</div>
          <div class="item-meta">
            <span>{{ it.seller_name }}</span>
            <span v-if="it.want_count">· {{ it.want_count }} 人想要</span>
          </div>
          <div class="item-meta" v-if="it.area">{{ it.area }}</div>
          <a v-if="it.item_url" :href="it.item_url" target="_blank" rel="noopener" class="item-link">查看商品 →</a>
        </el-card>
      </div>
      <el-pagination :total="total" :page-size="pageSize" :current-page="page" layout="prev, pager, next, total" @current-change="onPageChange" style="margin-top:16px" />
    </div>
    <el-empty v-else-if="!loading && !errorMsg" description="输入关键词开始搜索" />
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { searchItems } from '@/api/items'

const keyword = ref('')
const items = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const errorMsg = ref('')

async function doSearch() {
  if (!keyword.value.trim()) { ElMessage.warning('请输入关键词'); return }
  page.value = 1
  await fetchPage(1)
}

function onPageChange(p: number) {
  page.value = p;
  fetchPage(p)
}

async function fetchPage(p: number) {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await searchItems({ keyword: keyword.value.trim(), page: p, page_size: pageSize })
    if (!res.success) {
      errorMsg.value = res.error || res.message || '搜索失败';
      items.value = [];
    } else {
      items.value = res.data || [];
      total.value = res.total || items.value.length;
    }
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.detail || '搜索失败';
    items.value = [];
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.search-bar { display: flex; gap: 8px; }
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.item-card { }
.item-img-wrap { height: 180px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f5f6fa; border-radius: 8px; }
.item-img { width: 100%; height: 100%; object-fit: cover; }
.item-img-placeholder { color: #c0c4cc; font-size: 13px; }
.item-title { margin-top: 10px; font-size: 14px; line-height: 1.4; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.item-price { color: #f56c6c; font-size: 16px; font-weight: 600; margin-top: 8px; }
.item-meta { color: #909399; font-size: 12px; margin-top: 4px; }
.item-link { display: inline-block; margin-top: 8px; color: var(--el-color-primary); font-size: 13px; text-decoration: none; }
</style>
