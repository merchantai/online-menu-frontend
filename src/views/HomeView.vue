<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import MenuItem from '../components/MenuItem.vue';
import OrderSummary from '../components/OrderSummary.vue';
import ItemDrawer from '../components/ItemDrawer.vue';
import ManageOffersDrawer from '../components/ManageOffersDrawer.vue';
import OfferCarousel from '../components/OfferCarousel.vue';

import { getDiscoveryUrl } from '../utils/domain';
import { logAnalyticsEvent } from '../api';
import { watch } from 'vue';

const menuStore = useMenuStore();
const router = useRouter();
const route = useRoute();
const discoveryUrl = getDiscoveryUrl();

// Track store view
watch(() => menuStore.hotel, (hotel) => {
  if (hotel) {
    logAnalyticsEvent('view_store', {
      store_id: hotel.id,
      store_name: hotel.name,
      location: hotel.city || 'unspecified'
    });
  }
}, { immediate: true });

// UI State
const selectedItem = ref(null);
const searchQuery = ref('');
const collapsedCategories = ref({});
const showManageOffers = ref(false);
const showOfferCarousel = ref(false);

// Auto-show offers on load if present
onMounted(() => {
  // Simple check: if offers exist, show them. 
  // In a real app we might check a cookie to not annoy users every refresh,
  // but for this MVP, auto-show is good.
  if (menuStore.hotel?.offerImages?.length > 0) {
    showOfferCarousel.value = true;
  }
});

// Search and Filter Logic
const filteredMenuItems = computed(() => {
  if (!searchQuery.value) return menuStore.menuItems;
  const query = searchQuery.value.toLowerCase();
  return menuStore.menuItems.filter(item => 
    item.name.toLowerCase().includes(query) || 
    (item.description && item.description.toLowerCase().includes(query))
  );
});

// Categorization Logic
const categorizedMenu = computed(() => {
  const categories = {};
  
  filteredMenuItems.value.forEach(item => {
    // Standardized property name 'cat' as requested
    let itemCats = item.cat;
    
    // If it's a string, convert to array (for safety)
    if (typeof itemCats === 'string') {
      itemCats = itemCats.split(',').map(c => c.trim()).filter(c => c !== '');
    }
    
    const finalCats = Array.isArray(itemCats) && itemCats.length > 0 
      ? itemCats 
      : ['Uncategorized'];
      
    finalCats.forEach(cat => {
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(item);
    });
  });
  
  // Sort category names, keeping Uncategorized at the end
  return Object.keys(categories).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  }).map(name => ({
    name,
    items: categories[name]
  }));
});

const toggleCategory = (categoryName) => {
  collapsedCategories.value[categoryName] = !collapsedCategories.value[categoryName];
};

const openAddPage = () => {
  router.push(`/${menuStore.hotel.id}/manage/add`);
};

const openEditPage = (item) => {
  router.push(`/${menuStore.hotel.id}/manage/edit/${item.id}`);
};

const openItemDrawer = (item) => {
  selectedItem.value = item;
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
    <div v-else-if="menuStore.error" class="error-state">
      <div class="error-card">
        <span class="error-icon">❌</span>
        <h2>Store Not Found</h2>
        <p>{{ menuStore.error }}</p>
        <a :href="discoveryUrl" class="btn btn--primary">Back to Discovery</a>
      </div>
    </div>
    
    <div v-else-if="menuStore.hotel" class="menu-container">
      <!-- Availability Header if Disabled -->
      <div v-if="menuStore.hotel.isEnabled === false" class="error-state">
        <div class="error-card">
          <span class="error-icon">🔒</span>
          <h2>Shop Currently Unavailable</h2>
          <p>{{ menuStore.hotel.disabledMessage || 'This shop is temporarily not accepting orders.' }}</p>
          <a :href="discoveryUrl" class="btn btn--primary">Back to Discovery</a>
        </div>
      </div>

      <template v-else>
        <!-- Search and Admin Controls -->
        <div class="menu-header">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              placeholder="Search for dishes..." 
              class="search-input"
            />
          </div>
          
          <div class="header-actions">
            <!-- Customer Offer Button -->
            <button 
              v-if="menuStore.hotel?.offerImages?.length > 0" 
              @click="showOfferCarousel = true"
              class="btn btn--small btn--outline-primary mr-2"
            >
              🎉 Offers
            </button>

            <div v-if="menuStore.isAdmin" class="admin-actions">
              <button @click="showManageOffers = true" class="btn btn--primary">Manage Offers</button>
              <button @click="openAddPage" class="btn btn--primary">+ Add Item</button>
            </div>
          </div>
        </div>

        <!-- Categorized Menu -->
        <div v-for="category in categorizedMenu" :key="category.name" class="category-section">
          <div 
            class="category-header" 
            @click="toggleCategory(category.name)"
          >
            <h3>{{ category.name }} ({{ category.items.length }})</h3>
            <span class="chevron" :class="{ 'collapsed': collapsedCategories[category.name] }">▼</span>
          </div>
          
          <div 
            v-show="!collapsedCategories[category.name]" 
            class="menu-grid"
          >
            <MenuItem 
              v-for="item in category.items" 
              :key="item.id" 
              :item="item"
              @edit="openEditPage"
              @delete="handleDelete"
              @open="openItemDrawer"
            />
          </div>
        </div>

        <div v-if="categorizedMenu.length === 0" class="empty-state">
          <p>No items found matching your search.</p>
        </div>
      </template>
    </div>

    <!-- MenuItemForm removed -->
    
    <OrderSummary />
    
    <ItemDrawer 
        :isOpen="!!selectedItem" 
        :item="selectedItem" 
        @close="selectedItem = null" 
    />

    <ManageOffersDrawer 
      :isOpen="showManageOffers"
      @close="showManageOffers = false"
    />

    <OfferCarousel 
      :isOpen="showOfferCarousel"
      :images="menuStore.hotel?.offerImages || []"
      @close="showOfferCarousel = false"
    />
  </div>
</template>

<style scoped>
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 1rem;
  display: flex;
  justify-content: center;
}

.error-card {
  background: var(--bg-card);
  padding: 3rem 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  max-width: 400px;
  width: 100%;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.error-card h2 {
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.error-card p {
  color: var(--text-muted);
  margin-bottom: 2rem;
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

.admin-actions {
  display: flex;
  gap: 1rem;
}

.menu-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 600px) {
  .menu-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 450px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.6rem 0.8rem 0.6rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 50px;
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.category-section {
  margin-bottom: 0.5rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: var(--bg-card);
  border-radius: var(--radius);
  cursor: pointer;
  margin-bottom: 0.25rem;
  user-select: none;
  transition: background-color 0.2s;
}

.category-header:hover {
  background: var(--bg-body);
}

.category-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary-color);
}

.chevron {
  transition: transform 0.3s ease;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

.menu-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.25rem 0 1rem 0.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
}

.mr-2 { margin-right: 0.5rem; }

.btn--outline-primary {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn--outline-primary:hover {
  background: var(--primary-color);
  color: white;
}
</style>
