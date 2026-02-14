import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'

const AboutView = () => import('../views/AboutView.vue')
const ManageItemView = () => import('../views/ManageItemView.vue')
const AdminDashboardView = () => import('../views/AdminDashboardView.vue')
const ManageShopView = () => import('../views/ManageShopView.vue')
const JoinView = () => import('../views/JoinView.vue')
const LegalView = () => import('../views/LegalView.vue')
const AboutAppView = () => import('../views/AboutAppView.vue')

const routes = [
  // Platform Routes
  {
    path: '/',
    name: 'discovery',
    component: LandingView
  },
  {
    path: '/about-platform',
    name: 'about-platform',
    component: AboutAppView
  },
  {
    path: '/join',
    name: 'join',
    component: JoinView
  },
  {
    path: '/terms',
    name: 'terms',
    component: LegalView,
    props: { type: 'terms' }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: LegalView,
    props: { type: 'privacy' }
  },
  
  // Platform Admin Routes
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/manage/add',
    name: 'admin-add-shop',
    component: ManageShopView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/manage/edit/:hotelId',
    name: 'admin-edit-shop',
    component: ManageShopView,
    meta: { requiresAdmin: true }
  },

  // Shop Routes (ID in path)
  {
    path: '/:hotelId',
    name: 'home',
    component: HomeView
  },
  {
    path: '/:hotelId/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/:hotelId/manage/add',
    name: 'add-item',
    component: ManageItemView
  },
  {
    path: '/:hotelId/manage/edit/:itemId',
    name: 'edit-item',
    component: ManageItemView,
    props: true
  }
]
;

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard admin routes
import { useUserStore } from '../stores/user';
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAdmin) {
    if (!userStore.user || !userStore.isPlatformAdmin) {
      next('/');
      return;
    }
  }
  next();
});

export default router;