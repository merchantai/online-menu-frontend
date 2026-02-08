<script setup>
import { useMenuStore } from "../stores/menu";

defineProps({
  isOpen: Boolean
});

defineEmits(['close']);

const menuStore = useMenuStore();
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <div class="modal__header">
        <h2>About Hotel</h2>
        <button @click="$emit('close')" class="btn-close">&times;</button>
      </div>

      <div class="modal__content" v-if="menuStore.hotel">
        <div class="detail-group">
            <h3>{{ menuStore.hotel.name }}</h3>
            <p v-if="menuStore.hotel.address" class="address">{{ menuStore.hotel.address }}</p>
        </div>

        <div class="contact-info">
             <div v-if="menuStore.hotel.phone" class="contact-item">
                <span class="icon">📞</span>
                <span>{{ menuStore.hotel.phone }}</span>
             </div>
             <div v-if="menuStore.hotel.ownerEmail" class="contact-item">
                <span class="icon">✉️</span>
                <span>{{ Array.isArray(menuStore.hotel.ownerEmail) ? menuStore.hotel.ownerEmail[0] : menuStore.hotel.ownerEmail }}</span>
             </div>
        </div>
      </div>
      <div class="modal__content" v-else>
          <p>Loading details...</p>
      </div>
      
      <div class="modal__actions">
        <button @click="$emit('close')" class="btn btn--secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal__content {
    padding: 1rem 0;
    text-align: center;
}

.detail-group h3 {
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.address {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    align-items: center;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: var(--text-main);
}

.icon {
    font-size: 1.2rem;
}
</style>
