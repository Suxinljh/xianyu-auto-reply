<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>订单管理</span>
        <el-input v-model="keyword" placeholder="搜索订单/买家/商品" clearable style="width: 240px" />
      </div>
    </template>

    <el-table :data="filteredList" v-loading="loading" border stripe>
      <el-table-column prop="order_id" label="订单号" min-width="180" show-overflow-tooltip />
      <el-table-column prop="cookie_id" label="账号ID" min-width="130" show-overflow-tooltip />
      <el-table-column prop="item_id" label="商品ID" min-width="150" show-overflow-tooltip />
      <el-table-column prop="buyer_id" label="买家" min-width="120" show-overflow-tooltip />
      <el-table-column prop="spec_name" label="规格" min-width="100" show-overflow-tooltip />
      <el-table-column prop="quantity" label="数量" width="90" />
      <el-table-column prop="amount" label="金额" width="100" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusType(row.order_status)" size="small">{{ row.order_status || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="下单时间" min-width="150" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrders, type OrderInfo } from '@/api/orders'

const list = ref<OrderInfo[]>([])
const loading = ref(false)
const keyword = ref('')

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((o) =>
    (o.order_id || '').toLowerCase().includes(k) ||
    (o.buyer_id || '').toLowerCase().includes(k) ||
    (o.item_id || '').toLowerCase().includes(k) ||
    (o.cookie_id || '').toLowerCase().includes(k)
  )
})

function statusType(s?: string) {
  const map: Record<string, any> = {
    '已付款': 'success',
    'pending': 'warning',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'info',
  }
  return map[s || ''] || 'info'
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getOrders()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.detail || '加载订单失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
