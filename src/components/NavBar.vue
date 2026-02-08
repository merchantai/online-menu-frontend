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

.hamburger, .theme-toggle {
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-main);
    padding: 0.5rem;
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
