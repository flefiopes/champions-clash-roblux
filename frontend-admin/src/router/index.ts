import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'wars',
          name: 'wars',
          component: () => import('@/views/WarsView.vue'),
        },
        {
          path: 'factions',
          name: 'factions',
          component: () => import('@/views/FactionsView.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductsView.vue'),
        },
        {
          path: 'config',
          name: 'config',
          component: () => import('@/views/ConfigView.vue'),
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/views/TransactionsView.vue'),
        },
        {
          path: 'minigames',
          name: 'minigames',
          component: () => import('@/views/MinigamesView.vue'),
        },
        {
          path: 'minigames/logs',
          name: 'minigame-logs',
          component: () => import('@/views/MinigameLogsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/404.vue'),
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.initAuth();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
