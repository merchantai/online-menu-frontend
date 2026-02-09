import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref([]); // Array of { ...menuItem, quantity: 1 }

  // Total number of items in cart (Count units as 1, weights as 1 per entry or total? Usually count distinct items or total weight)
  // Let's stick to total count/weight sum for simple display
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + (item.quantityType === 'unit' ? item.quantity : 1), 0);
  });

  // Total price of items in cart
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  // Get quantity of a specific item
  const getItemQuantity = (itemId) => {
    const item = items.value.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const addItem = (item) => {
    const existingItem = items.value.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({ ...item, quantity: 1 });
    }
  };

  const updateQuantity = (item, quantity) => {
    const existingItem = items.value.find(i => i.id === item.id);
    if (quantity <= 0) {
      items.value = items.value.filter(i => i.id !== item.id);
      return;
    }
    
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      items.value.push({ ...item, quantity });
    }
  };

  const removeItem = (itemId) => {
    const index = items.value.findIndex(i => i.id === itemId);
    if (index !== -1) {
      if (items.value[index].quantity > 1) {
        items.value[index].quantity--;
      } else {
        items.value.splice(index, 1);
      }
    }
  };

  const clearCart = () => {
    items.value = [];
  };

  return {
    items,
    totalItems,
    totalPrice,
    getItemQuantity,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  };
});
