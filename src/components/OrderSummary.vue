<script setup>
import { computed, ref } from 'vue';
import { useCartStore } from '../stores/cart';
import { useMenuStore } from '../stores/menu';

const cartStore = useCartStore();
const menuStore = useMenuStore();
const isOrderOpen = ref(false);

const getLocales = (currency) => {
  const map = {
    'INR': 'en-IN',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP'
  };
  return map[currency] || 'en-IN';
};

const formattedTotal = computed(() => {
  // Use currency from the first item if available, otherwise INR
  const primaryCurrency = cartStore.items.length > 0 ? (cartStore.items[0].currency || 'INR') : 'INR';
  
  return new Intl.NumberFormat(getLocales(primaryCurrency), {
    style: 'currency',
    currency: primaryCurrency,
    currencyDisplay: 'symbol'
  }).format(cartStore.totalPrice);
});

const formatItemTotal = (item) => {
  const currency = item.currency || 'INR';
  return new Intl.NumberFormat(getLocales(currency), {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  }).format(item.price * item.quantity);
};

const sendOrderToWhatsapp = () => {
  if (!menuStore.hotel || !menuStore.hotel.whatsappNumber) {
    alert("WhatsApp number not configured for this hotel.");
    return;
  }

  // Remove non-numeric characters for the API link (wa.me expects just digits including country code)
  const phone = menuStore.hotel.whatsappNumber.replace(/[^\d]/g, '');
  let message = `*New Order for ${menuStore.hotel.name}*\n\n`;

  cartStore.items.forEach(item => {
    message += `${item.quantity} x ${item.name} - ${formatItemTotal(item)}\n`;
  });

  message += `\n*Total: ${formattedTotal.value}*`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
</script>

<template>
  <div v-if="cartStore.totalItems > 0">
    <!-- Sticky Footer -->
    <div class="order-summary-bar">
      <div class="order-summary__content">
        <div class="order-info">
          <span class="item-count">{{ cartStore.totalItems }} Items</span>
          <span class="total-price">Total: {{ formattedTotal }}</span>
        </div>
        <button @click="isOrderOpen = true" class="btn btn--primary btn--large">View Order</button>
      </div>
    </div>

    <!-- Order Modal -->
    <div v-if="isOrderOpen" class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h2>Your Order</h2>
          <button @click="isOrderOpen = false" class="btn-close">&times;</button>
        </div>
        
        <div class="order-list">
          <div v-for="item in cartStore.items" :key="item.id" class="order-item">
            <div class="order-item__info">
              <span class="order-item__name">{{ item.name }}</span>
              <span class="order-item__price-unit">@ {{ item.price }}</span>
            </div>
            
            <div class="order-item__actions">
              <div class="quantity-control-group small">
                <button @click="cartStore.removeItem(item.id)" class="btn-quantity">-</button>
                <span class="quantity-display">{{ item.quantity }}</span>
                <button @click="cartStore.addItem(item)" class="btn-quantity">+</button>
              </div>
              <span class="order-item__total">{{ formatItemTotal(item) }}</span>
            </div>
          </div>
        </div>

        <div class="order-total-row">
          <span>Total</span>
          <span>{{ formattedTotal }}</span>
        </div>

        <div class="modal__actions">
          <button @click="isOrderOpen = false" class="btn btn--secondary">Keep Ordering</button>
          <button @click="sendOrderToWhatsapp" class="btn btn--whatsapp">
            <span class="icon">💬</span> Order via WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Order Modal Styles */
.order-list {
  margin: 1.5rem 0;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}

.order-item__info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.order-item__name {
  font-weight: 500;
}

.order-item__price-unit {
  font-size: 0.8rem;
  color: var(--gray);
}

.order-item__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-item__total {
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

.quantity-control-group.small {
  transform: scale(0.9);
}

.order-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
}

.btn--whatsapp {
  background-color: #25D366;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn--whatsapp:hover {
  background-color: #128C7E;
}
</style>
