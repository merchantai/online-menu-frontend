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
  const currency = props.item.currency || 'INR';
  const unitSuffix = props.item.quantityType && props.item.quantityType !== 'unit' 
    ? ` / ${props.item.quantityType}` 
    : ' / item';

  const locales = {
    'INR': 'en-IN',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP'
  };
  
  const formatted = new Intl.NumberFormat(locales[currency] || 'en-IN', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  }).format(props.item.price);

  return `${formatted}${unitSuffix}`;
});

const quantity = computed(() => cartStore.getItemQuantity(props.item.id));

const handleAdd = () => cartStore.addItem(props.item);
const handleRemove = () => cartStore.removeItem(props.item.id);

const handleWeightInput = (event) => {
  const value = parseFloat(event.target.value);
  cartStore.updateQuantity(props.item, value || 0);
};
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
        <!-- Unit Based (+/-) -->
        <template v-if="item.quantityType === 'unit' || !item.quantityType">
          <div v-if="quantity > 0" class="quantity-control-group">
            <button @click="handleRemove" class="btn-quantity">-</button>
            <span class="quantity-display">{{ quantity }}</span>
            <button @click="handleAdd" class="btn-quantity">+</button>
          </div>
          <button v-else @click="handleAdd" class="btn btn--primary btn--add">
            Add
          </button>
        </template>

        <!-- Weight Based (Input Field) -->
        <template v-else>
          <div class="weight-input-group">
            <input 
              type="number" 
              step="0.01" 
              min="0"
              :placeholder="`Qty in ${item.quantityType}`"
              class="weight-input"
              :value="quantity || ''"
              @input="handleWeightInput"
            />
            <span class="weight-unit">{{ item.quantityType }}</span>
          </div>
        </template>
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

.weight-input-group {
  display: flex;
  align-items: center;
  background: var(--bg-body);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-color);
  max-width: 120px;
}

.weight-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0;
  text-align: center;
}

.weight-input:focus {
  outline: none;
}

/* Hide arrows in number input */
.weight-input::-webkit-inner-spin-button,
.weight-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.weight-unit {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 700;
  margin-left: 0.25rem;
}
</style>
