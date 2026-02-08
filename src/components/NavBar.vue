<script setup>
import { ref, onMounted } from 'vue';
import { useMenuStore } from "../stores/menu";

const emit = defineEmits(['open-menu']);
const menuStore = useMenuStore();

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    isDark.value = true;
    document.documentElement.setAttribute("data-theme", "dark");
  }
});
</script>

<template>
  <nav class="navbar">
    <div class="navbar__container">
      <div class="navbar__brand">
        <router-link to="/" class="brand-link">
            <div v-if="menuStore.hotel">
                <img v-if="menuStore.hotel.logo" :src="menuStore.hotel.logo" :alt="menuStore.hotel.name" class="navbar__logo" />
                <h1 v-else>{{ menuStore.hotel.name }}</h1>
            </div>
            <h1 v-else>Loading...</h1>
        </router-link>
      </div>
      
      <div class="navbar__actions">
        <a 
          v-if="menuStore.hotel && menuStore.hotel.phone" 
          :href="`tel:${(menuStore.hotel.code || '') + menuStore.hotel.phone}`" 
          class="btn btn--primary btn--call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="icon">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.49-5.15-3.8-6.62-6.62l1.97-1.57c.23-.23.31-.56.25-.87-.36-1.11-.56-2.3-.56-3.53a.996.996 0 0 0-1-1H4.05a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.95a.996.996 0 0 0-1-1z"/>
          </svg>
          <span class="text">Call to Order</span>
        </a>
        <button @click="toggleTheme" class="btn btn--icon theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button @click="$emit('open-menu')" class="btn btn--icon hamburger">
          ☰
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar__brand h1 {
    font-size: 1.5rem;
    color: var(--text-main);
    margin: 0;
}

.brand-link {
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
}

.navbar__logo {
  height: 50px;
  width: auto;
  border-radius: 8px;
  object-fit: contain;
}

.navbar__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn--call {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
}

.hamburger, .theme-toggle {
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-main);
    padding: 0.5rem;
}

@media (max-width: 600px) {
    .btn--call .text {
        display: none;
    }
    .btn--call {
        padding: 0.5rem;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        justify-content: center;
    }
}
</style>

<style scoped>
.hotel-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__logo {
  height: 60px;
  width: auto;
  border-radius: 8px;
  object-fit: contain;
}

.hotel-details {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.hotel-address {
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 2px;
}

.hotel-contact {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .hotel-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .navbar__logo {
      height: 50px;
  }
}
</style>
