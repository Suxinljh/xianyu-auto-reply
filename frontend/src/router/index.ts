import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '@/api/http'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/LayoutView.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { title: '仪表盘' } },
        { path: 'accounts', name: 'accounts', component: () => import('@/views/accounts/AccountListView.vue'), meta: { title: '账号管理' } },
        { path: 'items', name: 'items', component: () => import('@/views/items/ItemListView.vue'), meta: { title: '商品管理' } },
        { path: 'item-search', name: 'item-search', component: () => import('@/views/search/ItemSearchView.vue'), meta: { title: '商品搜索' } },
        { path: 'orders', name: 'orders', component: () => import('@/views/orders/OrderListView.vue'), meta: { title: '订单管理' } },
        { path: 'delivery', name: 'delivery', component: () => import('@/views/delivery/DeliveryRuleView.vue'), meta: { title: '自动发货' } },
        { path: 'cards', name: 'cards', component: () => import('@/views/cards/CardListView.vue'), meta: { title: '卡券管理' } },
        { path: 'keywords', name: 'keywords', component: () => import('@/views/keywords/KeywordView.vue'), meta: { title: '关键词回复' } },
        { path: 'notifications', name: 'notifications', component: () => import('@/views/notifications/NotificationView.vue'), meta: { title: '通知渠道' } },
        { path: 'ai', name: 'ai', component: () => import('@/views/ai/AIView.vue'), meta: { title: 'AI 回复', admin: true } },
        { path: 'settings', name: 'settings', component: () => import('@/views/system/SystemSettingView.vue'), meta: { title: '系统设置', admin: true } },
        { path: 'logs', name: 'logs', component: () => import('@/views/logs/LogView.vue'), meta: { title: '系统日志', admin: true } },
        { path: 'users', name: 'users', component: () => import('@/views/users/UserManagementView.vue'), meta: { title: '用户管理', admin: true } },
        { path: 'data', name: 'data', component: () => import('@/views/data/DataManagementView.vue'), meta: { title: '数据管理', admin: true } },
        { path: 'risk', name: 'risk', component: () => import('@/views/risk/RiskLogView.vue'), meta: { title: '风险日志', admin: true } },
        { path: 'item-reply', name: 'item-reply', component: () => import('@/views/itemReply/ItemReplyView.vue'), meta: { title: '商品指定回复' } },
        { path: 'msg-notifications', name: 'msg-notifications', component: () => import('@/views/msgNotifications/MsgNotificationView.vue'), meta: { title: '消息通知配置' } },
        { path: 'about', name: 'about', component: () => import('@/views/about/AboutView.vue'), meta: { title: '关于' } }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
  ]
})

// 全局登录守卫
router.beforeEach((to) => {
  const token = getToken()
  if (!to.meta.public && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && token) {
    return { path: '/dashboard' }
  }
  return true
})

export default router
