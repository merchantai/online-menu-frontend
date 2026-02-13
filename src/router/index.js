import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'

const AboutView = () => import('../views/AboutView.vue')
const ManageItemView = () => import('../views/ManageItemView.vue')
const JoinView = () => import('../views/JoinView.vue')
const LegalView = () => import('../views/LegalView.vue')

const routes = [
  // Platform Routes
  {
    path: '/',
    name: 'discovery',
    component: LandingView
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

export default router;