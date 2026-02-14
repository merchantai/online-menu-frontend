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

const formatValue = (value, currency) => {
  const locales = {
    'INR': 'en-IN',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP'
  };
  return new Intl.NumberFormat(locales[currency] || 'en-IN', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  }).format(value);
};

const formattedPrice = computed(() => {
  const currency = props.item.currency || 'INR';
  const unitSuffix = props.item.quantityType && props.item.quantityType !== 'unit' 
    ? ` / ${props.item.quantityType}` 
    : ' / item';

  return `${formatValue(props.item.price, currency)}${unitSuffix}`;
});

const discountedPrice = computed(() => {
  if (!props.item.discountType || props.item.discountType === 'none') return null;
  
  const currency = props.item.currency || 'INR';
  const unitSuffix = props.item.quantityType && props.item.quantityType !== 'unit' 
    ? ` / ${props.item.quantityType}` 
    : ' / item';

  let finalPrice = props.item.price;
  if (props.item.discountType === 'percentage') {
    finalPrice = props.item.price * (1 - props.item.discountValue / 100);
  } else if (props.item.discountType === 'amount') {
    finalPrice = Math.max(0, props.item.price - props.item.discountValue);
  } else if (props.item.discountType === 'units') {
     // For units, the "unit price" doesn't strictly change but the subtotal does.
     // However, for UI we can show "B1G1" or similar
     return null; 
  }

  return `${formatValue(finalPrice, currency)}${unitSuffix}`;
});

const offerLabel = computed(() => {
  if (props.item.discountType === 'percentage') return `${props.item.discountValue}% OFF`;
  if (props.item.discountType === 'amount') return `OFFER`;
  if (props.item.discountType === 'units') return `BUY 1 GET ${props.item.discountValue - 1} FREE`;
  return null;
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
  <div 
    class="menu-item-row" 
    :class="{ 'is-monochrome': item.available === false && !menuStore.isAdmin }"
    @click="(item.available !== false || menuStore.isAdmin) && $emit('open', item)"
  >
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
      <div class="menu-item__header">
        <h3 class="menu-item__title">{{ item.name }}</h3>
        <span v-if="offerLabel" class="badge-offer">{{ offerLabel }}</span>
      </div>
      <p class="menu-item__description">{{ item.description }}</p>
      <div class="menu-item__price-container">
        <template v-if="discountedPrice">
          <span class="menu-item__price">{{ discountedPrice }}</span>
          <span class="menu-item__price--original">{{ formattedPrice }}</span>
        </template>
        <span v-else class="menu-item__price">{{ formattedPrice }}</span>
        <span v-if="item.available === false" class="badge-unavailable">Out of Stock</span>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="menu-item__actions" @click.stop>
      <!-- Admin Actions -->
      <div v-if="menuStore.isAdmin" class="admin-actions no-grayscale">
        <button @click.stop="emit('edit', item)" class="btn btn--small btn--outline" aria-label="Edit">✏️</button>
        <button @click.stop="emit('delete', item.id)" class="btn btn--small btn--danger" aria-label="Delete">🗑️</button>
      </div>

      <!-- Quantity Controls -->
      <div v-else class="quantity-controls" :class="{ 'is-disabled': item.available === false }">
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
              :disabled="item.available === false"
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
.menu-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.badge-offer {
  background: #ff4d4d;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.menu-item__price--original {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: line-through;
  margin-left: 0.5rem;
}
</style>
