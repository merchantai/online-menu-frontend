<script setup>
import { ref } from 'vue';
import { useMenuStore } from '../stores/menu';
import MenuItem from '../components/MenuItem.vue';
import MenuItemForm from '../components/MenuItemForm.vue';
import OrderSummary from '../components/OrderSummary.vue';
import ItemDrawer from '../components/ItemDrawer.vue';

const menuStore = useMenuStore();

// UI State
const isFormOpen = ref(false);
const editingItem = ref(null);
const selectedItem = ref(null);

const openAddModal = () => {
  editingItem.value = null; // Clear editing item
  isFormOpen.value = true;
};

const openEditModal = (item) => {
  editingItem.value = item;
  isFormOpen.value = true;
};

const openItemDrawer = (item) => {
  selectedItem.value = item;
};

const handleSave = async (data) => {
  try {
    const { file, ...itemData } = data;
    
    if (editingItem.value) {
      await menuStore.updateItem(editingItem.value.id, itemData, file);
    } else {
      await menuStore.addItem(itemData, file);
    }
    isFormOpen.value = false;
  } catch (error) {
    alert("Failed to save item: " + error.message);
  }
};

const handleDelete = async (itemId) => {
  if (confirm("Are you sure you want to delete this item?")) {
    await menuStore.deleteItem(itemId);
  }
};
</script>

<template>
  <div class="home-view">
    <div v-if="menuStore.loading" class="loading-state">Loading menu...</div>
    <div v-else-if="menuStore.error" class="error-state">{{ menuStore.error }}</div>
    
    <div v-else class="menu-container">
      <!-- Admin Controls -->
      <div v-if="menuStore.isAdmin" class="admin-controls">
        <button @click="openAddModal" class="btn btn--primary btn--large">+ Add New Item</button>
      </div>

      <!-- Menu Grid -->
      <div class="menu-grid">
        <MenuItem 
          v-for="item in menuStore.menuItems" 
          :key="item.id" 
          :item="item"
          @edit="openEditModal"
          @delete="handleDelete"
          @open="openItemDrawer"
        />
      </div>

      <div v-if="menuStore.menuItems.length === 0" class="empty-state">
        <p>No items in the menu yet.</p>
      </div>
    </div>

    <MenuItemForm 
      :isOpen="isFormOpen" 
      :item="editingItem"
      @save="handleSave" 
      @cancel="isFormOpen = false"
    />
    
    <OrderSummary />
    
    <ItemDrawer 
        :isOpen="!!selectedItem" 
        :item="selectedItem" 
        @close="selectedItem = null" 
    />
  </div>
</template>

<style scoped>
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--text-muted);
}

.error-state {
  color: var(--danger-color);
}

.menu-container {
  max-width: 800px;
  margin: 0 auto;
}

.menu-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-bottom: 80px;
}

.admin-controls {
  margin-bottom: 1.5rem;
  text-align: right;
}
</style>
