<script setup>
import { useUserStore } from "../stores/user";
import { useMenuStore } from "../stores/menu";

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const userStore = useUserStore();
const menuStore = useMenuStore();

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
          <router-link to="/" class="nav-item" @click="$emit('close')">Home</router-link>
          <router-link to="/about" class="nav-item" @click="$emit('close')">About Hotel</router-link>
        </nav>

        <div class="side-menu__footer">
          <div v-if="userStore.user" class="user-info">
            <span class="user-email">{{ userStore.user.email }}</span>
            <button @click="handleLogout" class="btn btn--secondary btn--full">Logout</button>
          </div>
          <button v-else @click="handleLogin" class="btn btn--primary btn--full">Login as Owner</button>
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

.nav-item {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-main);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--bg-body);
  color: var(--primary-color);
}

.router-link-active {
  color: var(--primary-color);
  font-weight: 700;
  background-color: color-mix(in srgb, var(--primary-color), transparent 90%);
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
