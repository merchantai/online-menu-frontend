<script setup>
import { computed } from 'vue';
import { useUserStore } from "../stores/user";
import { useMenuStore } from "../stores/menu";
import { getDiscoveryUrl } from "../utils/domain";

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const userStore = useUserStore();
const menuStore = useMenuStore();

const discoveryUrl = computed(() => getDiscoveryUrl());

const handleLogin = () => {
  userStore.login();
  emit('close');
};

const handleLogout = () => {
  userStore.logout();
  emit('close');
};
</script>

<template>
  <div>
    <div class="side-menu-overlay" :class="{ 'open': isOpen }" @click="$emit('close')"></div>
    <aside class="side-menu" :class="{ 'open': isOpen }">
      <div class="side-menu__header">
        <h2>Menu</h2>
        <button @click="$emit('close')" class="btn-close">&times;</button>
      </div>

      <div class="side-menu__content">
        <nav class="side-nav">
          <!-- Always show Discovery Home for easy navigation back to platform -->
          <router-link to="/" class="nav-item" exact-active-class="router-link-exact-active" @click="$emit('close')">
            <span class="icon">🔍</span> Discovery Home
          </router-link>
          
          <!-- Shop Context Links (Only shown if a shop is active) -->
          <router-link v-if="menuStore.hotel" :to="{ name: 'home' }" class="nav-item" exact-active-class="router-link-exact-active" @click="$emit('close')">
            <span class="icon">🍴</span> Shop Menu
          </router-link>

          <router-link v-if="menuStore.hotel" :to="'/' + menuStore.hotel.id + '/about'" class="nav-item" @click="$emit('close')">
            <span class="icon">ℹ️</span> About Shop
          </router-link>

          <!-- Platform Admin Link -->
          <router-link v-if="userStore.isPlatformAdmin" to="/admin" class="nav-item" exact-active-class="router-link-exact-active" @click="$emit('close')">
            <span class="icon">🛠️</span> Admin Dashboard
          </router-link>

          <!-- Platform Links (Always Visible) -->
          <div class="nav-divider"></div>
          
          <router-link to="/about-platform" class="nav-item" exact-active-class="router-link-exact-active" @click="$emit('close')">
            <span class="icon">📖</span> About Pro Menu
          </router-link>

          <router-link to="/join" class="nav-item" @click="$emit('close')">
            <span class="icon">🚀</span> Join Pro Menu
          </router-link>

          <router-link to="/terms" class="nav-item" @click="$emit('close')">
            <span class="icon">📜</span> Terms of Service
          </router-link>

          <router-link to="/privacy" class="nav-item" @click="$emit('close')">
            <span class="icon">🛡️</span> Privacy Policy
          </router-link>
        </nav>

        <div class="side-menu__footer">
          <div v-if="userStore.user" class="user-info">
            <span class="user-email">{{ userStore.user.email }}</span>
            <button v-if="menuStore.hotel" @click="handleLogout" class="btn btn--secondary btn--full">Logout</button>
            <button v-else @click="handleLogout" class="btn btn--secondary btn--full">Logout Admin</button>
          </div>
          <button v-else-if="menuStore.hotel" @click="handleLogin" class="btn btn--primary btn--full">Login as Owner</button>
          <button v-else @click="handleLogin" class="btn btn--primary btn--full">Admin Login</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.side-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s;
}

.side-menu-overlay.open {
  opacity: 1;
  visibility: visible;
}

.side-menu {
  position: fixed;
  top: 0;
  right: 0; /* Slide from right */
  width: 280px;
  height: 100%;
  background: var(--bg-card);
  z-index: 999;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 15px rgba(0,0,0,0.1);
}

.side-menu.open {
  transform: translateX(0);
}

.side-menu__header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.side-menu__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
}

.nav-item {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-main);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-item--highlight {
  background: color-mix(in srgb, var(--primary-color), transparent 92%);
  color: var(--primary-color);
}

.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.nav-item:hover {
  background: var(--bg-body);
  color: var(--primary-color);
}

.router-link-active:not(.router-link-exact-active) {
  background-color: transparent;
  color: var(--text-main);
  font-weight: 500;
}

.router-link-exact-active {
  color: var(--primary-color) !important;
  font-weight: 700;
  background-color: color-mix(in srgb, var(--primary-color), transparent 90%) !important;
}

/* Ensure sub-paths don't highlight the parent implicitly in a way that looks messy */
.nav-item:not(.router-link-exact-active) {
  background-color: transparent;
  font-weight: 500;
}

.side-menu__footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
}

.btn--full {
  width: 100%;
}
</style>
