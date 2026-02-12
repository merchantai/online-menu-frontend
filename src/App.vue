<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from './stores/menu';
import { getStoreId } from './utils/domain';
import { logAnalyticsEvent } from './api';
import NavBar from './components/NavBar.vue';
import SideMenu from './components/SideMenu.vue';

const menuStore = useMenuStore();
const route = useRoute();
const isSideMenuOpen = ref(false);

onMounted(() => {
  logAnalyticsEvent('page_view', {
    page_path: window.location.pathname,
    page_location: window.location.href
  });
});

const initStore = async (storeId) => {
  // If we're on a platform page or ID is missing, clear the store
  if (!storeId) {
    menuStore.hotel = null;
    menuStore.menuItems = [];
    return;
  }
  
  // Don't re-fetch if we're already viewing this hotel
  if (menuStore.hotel?.id === storeId) return;

  try {
    await menuStore.fetchHotelAndMenu(storeId);
  } catch (error) {
    console.error("Initialization error:", error);
  }
};

// React to route changes
import { watch } from 'vue';
watch(
  () => route.params.hotelId,
  (newId) => {
    initStore(newId);
  },
  { immediate: true } // Handles both initial load and subsequent changes
);
</script>

<template>
  <div class="app-container">
    <NavBar @open-menu="isSideMenuOpen = true" />

    <main class="main-content">
      <router-view :key="route.path" />
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
