<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from './stores/menu';
import { getStoreId } from './utils/domain';
import NavBar from './components/NavBar.vue';
import SideMenu from './components/SideMenu.vue';
import LandingView from './views/LandingView.vue';

const menuStore = useMenuStore();
const route = useRoute();

// UI State
const isSideMenuOpen = ref(false);
const isStoreActive = ref(false);

onMounted(async () => {
  try {
    const storeId = getStoreId();
    if (storeId) {
      isStoreActive.value = true;
      await menuStore.fetchHotelAndMenu(storeId);
    } else {
      isStoreActive.value = false;
    }
  } catch (error) {
    console.error("Initialization error:", error);
    isStoreActive.value = false;
  }
});
</script>

<template>
  <div class="app-container">
    <NavBar @open-menu="isSideMenuOpen = true" />

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <div :key="route.fullPath">
            <template v-if="!isStoreActive && route.path === '/'">
              <LandingView />
            </template>
            <component :is="Component" v-else />
          </div>
        </transition>
      </router-view>
    </main>

    <SideMenu 
        :isOpen="isSideMenuOpen" 
        @close="isSideMenuOpen = false"
    />
  </div>
</template>

<style>
/* Global Transition Styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
