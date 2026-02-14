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
  if (!props.item) return "";
  const currency = props.item.currency || 'INR';
  const unitSuffix = props.item.quantityType && props.item.quantityType !== 'unit' 
    ? ` / ${props.item.quantityType}` 
    : ' / item';

  return `${formatValue(props.item.price, currency)}${unitSuffix}`;
});

const discountedPrice = computed(() => {
  if (!props.item || !props.item.discountType || props.item.discountType === 'none') return null;
  
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
     return null; 
  }

  return `${formatValue(finalPrice, currency)}${unitSuffix}`;
});

const offerLabel = computed(() => {
  if (!props.item) return null;
  if (props.item.discountType === 'percentage') return `${props.item.discountValue}% OFF`;
  if (props.item.discountType === 'amount') return `OFFER`;
  if (props.item.discountType === 'units') return `BUY 1 GET ${props.item.discountValue - 1} FREE`;
  return null;
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
                <div>
                   <h2 class="drawer-title">{{ item.name }}</h2>
                   <span v-if="offerLabel" class="badge-offer">{{ offerLabel }}</span>
                </div>
                <div class="drawer-price-container">
                   <template v-if="discountedPrice">
                      <span class="drawer-price">{{ discountedPrice }}</span>
                      <span class="drawer-price--original">{{ formattedPrice }}</span>
                   </template>
                   <span v-else class="drawer-price">{{ formattedPrice }}</span>
                </div>
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
.badge-offer {
  background: #ff4d4d;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  display: inline-block;
  margin-top: 0.5rem;
}

.drawer-price-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.drawer-price--original {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-decoration: line-through;
  margin-top: 0.2rem;
}
</style>
