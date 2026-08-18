<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">闲鱼自动回复系统</div>
      <el-menu :default-active="activeMenu" router class="menu">
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/accounts">
          <el-icon><User /></el-icon>
          <span>账号管理</span>
        </el-menu-item>
        <el-menu-item index="/items">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/item-search">
          <el-icon><Search /></el-icon>
          <span>商品搜索</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/delivery">
          <el-icon><Van /></el-icon>
          <span>自动发货</span>
        </el-menu-item>
        <el-menu-item index="/cards">
          <el-icon><CreditCard /></el-icon>
          <span>卡券管理</span>
        </el-menu-item>
        <el-menu-item index="/keywords">
          <el-icon><ChatDotRound /></el-icon>
          <span>关键词回复</span>
        </el-menu-item>
        <el-menu-item index="/notifications">
          <el-icon><Bell /></el-icon>
          <span>通知渠道</span>
        </el-menu-item>
        <el-menu-item index="/ai">
          <el-icon><MagicStick /></el-icon>
          <span>AI 回复</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>系统日志</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/data">
          <el-icon><Grid /></el-icon>
          <span>数据管理</span>
        </el-menu-item>
        <el-menu-item index="/risk">
          <el-icon><Warning /></el-icon>
          <span>风险日志</span>
        </el-menu-item>
        <el-menu-item index="/item-reply">
          <el-icon><ChatLineSquare /></el-icon>
          <span>商品指定回复</span>
        </el-menu-item>
        <el-menu-item index="/msg-notifications">
          <el-icon><Message /></el-icon>
          <span>消息通知配置</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>关于</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-right">
          <el-tag v-if="auth.isAdmin" type="warning" size="small">管理员</el-tag>
          <span class="username">{{ auth.username }}</span>
          <el-button link type="primary" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string) || '')

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: #fff; border-right: 1px solid #ebeef5; }
.logo { height: 60px; line-height: 60px; text-align: center; font-weight: 600; font-size: 16px; color: var(--el-color-primary); }
.menu { border-right: none; }
.header { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #ebeef5; }
.header-title { font-size: 16px; font-weight: 500; }
.header-right { display: flex; align-items: center; gap: 12px; }
.main { background: #f5f6fa; padding: 16px; }
</style>
