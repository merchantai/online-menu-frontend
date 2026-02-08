<script setup>
import { computed } from "vue";
import { useCartStore } from "../stores/cart";

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close"]);
const cartStore = useCartStore();

const quantity = computed(() => {
  if (!props.item) return 0;
  return cartStore.getItemQuantity(props.item.id);
});

const formattedPrice = computed(() => {
  if (!props.item) return "";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(props.item.price);
});

const handleAdd = () => {
    if(props.item) cartStore.addItem(props.item);
}

const handleRemove = () => {
    if(props.item) cartStore.removeItem(props.item.id);
}
</script>

<template>
  <div>
    <!-- Overlay -->
    <div v-if="isOpen" class="drawer-overlay" @click="$emit('close')"></div>
    
    <!-- Drawer -->
    <div class="bottom-drawer" :class="{ 'is-open': isOpen }">
      <button class="drawer-close" @click="$emit('close')">&times;</button>
      
      <div v-if="item" class="drawer-content">
        <div class="drawer-image-container">
             <img 
                :src="item.image || 'https://placehold.co/600x400?text=No+Image'" 
                :alt="item.name" 
                class="drawer-image"
              />
        </div>

        <div class="drawer-details">
            <div class="drawer-header">
                <h2 class="drawer-title">{{ item.name }}</h2>
                <span class="drawer-price">{{ formattedPrice }}</span>
            </div>
            
            <p class="drawer-description">{{ item.description }}</p>

            <div class="drawer-actions">
                <div v-if="quantity > 0" class="quantity-control-group large">
                    <button @click="handleRemove" class="btn-quantity">-</button>
                    <span class="quantity-display">{{ quantity }}</span>
                    <button @click="handleAdd" class="btn-quantity">+</button>
                </div>
                <button v-else @click="handleAdd" class="btn btn--primary btn--full btn--large">
                    Add to Order
                </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles will be in global css as per project pattern, but basic layout here */
</style>
