<script setup>
import { computed } from "vue";
import { useMenuStore } from "../stores/menu";
import { useCartStore } from "../stores/cart";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["edit", "delete", "open"]);
const menuStore = useMenuStore();
const cartStore = useCartStore();

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(props.item.price);
});

const quantity = computed(() => cartStore.getItemQuantity(props.item.id));

const handleAdd = () => cartStore.addItem(props.item);
const handleRemove = () => cartStore.removeItem(props.item.id);
</script>

<template>
  <div class="menu-item-row" @click="$emit('open', item)">
    <!-- Image -->
    <div class="menu-item__image-container">
      <img 
        :src="item.image || 'https://placehold.co/120x120?text=No+Image'" 
        :alt="item.name" 
        class="menu-item__image"
        loading="lazy"
      />
    </div>
    
    <!-- Details -->
    <div class="menu-item__details">
      <h3 class="menu-item__title">{{ item.name }}</h3>
      <p class="menu-item__description">{{ item.description }}</p>
      <span class="menu-item__price">{{ formattedPrice }}</span>
    </div>
    
    <!-- Actions -->
    <div class="menu-item__actions" @click.stop>
      <!-- Admin Actions -->
      <div v-if="menuStore.isAdmin" class="admin-actions">
        <button @click="emit('edit', item)" class="btn btn--small btn--outline" aria-label="Edit">✏️</button>
        <button @click="emit('delete', item.id)" class="btn btn--small btn--danger" aria-label="Delete">🗑️</button>
      </div>

      <!-- Quantity Controls -->
      <div v-else class="quantity-controls">
        <div v-if="quantity > 0" class="quantity-control-group">
          <button @click="handleRemove" class="btn-quantity">-</button>
          <span class="quantity-display">{{ quantity }}</span>
          <button @click="handleAdd" class="btn-quantity">+</button>
        </div>
        <button v-else @click="handleAdd" class="btn btn--primary btn--add">
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles specific to this component */
.admin-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
