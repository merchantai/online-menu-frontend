import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ManageItemView from '../views/ManageItemView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/join',
    name: 'join',
    component: () => import('../views/JoinView.vue')
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('../views/LegalView.vue'),
    props: { type: 'terms' }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/LegalView.vue'),
    props: { type: 'privacy' }
  },
  {
    path: '/manage/add',
    name: 'add-item',
    component: ManageItemView
  },
  {
    path: '/manage/edit/:itemId',
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

export default router;