<script setup>
import { useMenuStore } from '../stores/menu';

const menuStore = useMenuStore();
</script>

<template>
  <div class="about-view">
    <div v-if="menuStore.hotel" class="hotel-card">
      <div class="hotel-header">
         <img v-if="menuStore.hotel.logo" :src="menuStore.hotel.logo" :alt="menuStore.hotel.name" class="hotel-logo" />
         <h1>{{ menuStore.hotel.name }}</h1>
      </div>

      <div class="hotel-info">
        <div class="info-group">
            <h3>Address</h3>
            <p>{{ menuStore.hotel.address || 'Address not available' }}</p>
        </div>

        <div class="info-group">
            <h3>Contact</h3>
            <p v-if="menuStore.hotel.phone">📞 {{ menuStore.hotel.phone }}</p>
            <p v-if="menuStore.hotel.ownerEmail">
                ✉️ {{ Array.isArray(menuStore.hotel.ownerEmail) ? menuStore.hotel.ownerEmail[0] : menuStore.hotel.ownerEmail }}
            </p>
        </div>
      </div>
    </div>
    <div v-else class="loading">Loading details...</div>
  </div>
</template>

<style scoped>
.about-view {
    padding: 2rem 1rem;
    display: flex;
    justify-content: center;
}

.hotel-card {
    background: var(--bg-card);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    max-width: 500px;
    width: 100%;
    text-align: center;
}

.hotel-logo {
    width: 100px;
    height: 100px;
    object-fit: contain;
    margin-bottom: 1rem;
    border-radius: 50%;
    background: var(--bg-body);
}

.hotel-header h1 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    color: var(--text-main);
}

.info-group {
    margin-bottom: 1.5rem;
}

.info-group h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.info-group p {
    font-size: 1.1rem;
    color: var(--text-main);
    line-height: 1.5;
}
</style>
