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