<script setup>
import { onMounted, ref } from 'vue';
import { useMenuStore } from './stores/menu';
import NavBar from './components/NavBar.vue';
import SideMenu from './components/SideMenu.vue';

const menuStore = useMenuStore();

// UI State
const isSideMenuOpen = ref(false);

onMounted(async () => {
  // Get hotel ID from URL query param
  const params = new URLSearchParams(window.location.search);
  const hotelId = params.get('hotel') || 'hotel1';
  
  if (hotelId) {
    await menuStore.fetchHotelAndMenu(hotelId);
  }
});
</script>

<template>
  <div class="app-container">
    <NavBar @open-menu="isSideMenuOpen = true" />

    <main class="main-content">
       <router-view></router-view>
    </main>

    <SideMenu 
        :isOpen="isSideMenuOpen" 
        @close="isSideMenuOpen = false"
    />
  </div>
</template>
