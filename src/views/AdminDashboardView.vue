<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import { getStoreUrl } from '../utils/domain';

const menuStore = useMenuStore();
const router = useRouter();

const searchQuery = ref('');
const selectedShop = ref(null);
const isDrawerOpen = ref(false);

const loading = computed(() => menuStore.loading);
const hotels = computed(() => menuStore.allHotels);

onMounted(async () => {
  await menuStore.fetchAllHotels(true);
});

const filteredHotels = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return hotels.value;
  return hotels.value.filter(h => 
    h.name.toLowerCase().includes(query) || 
    (h.city && h.city.toLowerCase().includes(query)) ||
    h.id.toLowerCase().includes(query)
  );
});

const openShopDrawer = (shop) => {
  selectedShop.value = shop;
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const goToAddShop = () => {
  router.push('/admin/manage/add');
};

const goToEditShop = (hotelId) => {
  router.push(`/admin/manage/edit/${hotelId}`);
};

const goToManageItems = (hotelId) => {
  router.push(`/${hotelId}`);
};

const handleDeleteShop = async (hotelId) => {
  if (confirm(`Are you sure you want to delete this shop? All menu items and branding will be lost.`)) {
    try {
      await menuStore.deleteShop(hotelId);
      if (selectedShop.value?.id === hotelId) {
        closeDrawer();
      }
    } catch (err) {
      alert("Failed to delete shop: " + err.message);
    }
  }
};

const getOwnerEmails = (owners) => {
  if (Array.isArray(owners)) return owners.join(', ');
  return owners || 'No owner specified';
};
</script>

<template>
  <div class="admin-dashboard">
    <div class="container--wide">
      <header class="admin-header">
        <div class="header-main">
          <h1>Platform Admin Dashboard</h1>
          <p class="text-muted">Manage all shops and platform content</p>
        </div>
        <button @click="goToAddShop" class="btn btn--primary">+ Add New Shop</button>
      </header>

      <div class="admin-toolbar">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            placeholder="Search by name, city or ID..." 
            class="search-input"
          />
        </div>
        <div class="stats">
          <strong>{{ hotels.length }}</strong> Total Shops
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <span class="spinner">⏳</span> Loading shops...
      </div>

      <div v-else-if="filteredHotels.length === 0" class="empty-state">
        <p>No shops found.</p>
      </div>

      <div v-else class="shop-grid">
        <div 
          v-for="shop in filteredHotels" 
          :key="shop.id" 
          class="shop-card card"
          @click="openShopDrawer(shop)"
        >
          <div class="shop-card__image">
            <img :src="shop.image || shop.logo || 'https://placehold.co/100x100?text=Shop'" alt="Shop Logo" />
            <span :class="['status-pill', shop.isEnabled !== false ? 'status--active' : 'status--disabled']">
              {{ shop.isEnabled !== false ? 'Active' : 'Disabled' }}
            </span>
          </div>
          <div class="shop-card__content">
            <h3 class="shop-name">{{ shop.name }}</h3>
            <p class="shop-location">📍 {{ shop.city || 'Location N/A' }}</p>
            <p class="shop-id">#{{ shop.id }}</p>
            
            <div class="shop-card__actions" @click.stop>
              <button @click="goToManageItems(shop.id)" class="btn btn--small btn--outline" title="Manage Items">📦 Items</button>
              <button @click="goToEditShop(shop.id)" class="btn btn--small btn--outline" title="Edit Shop">✏️</button>
              <button @click="handleDeleteShop(shop.id)" class="btn btn--small btn--danger" title="Delete Shop">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shop Details Drawer -->
    <div 
      class="drawer-overlay" 
      :class="{ 'open': isDrawerOpen }" 
      @click="closeDrawer"
    ></div>
    
    <div class="shop-drawer" :class="{ 'open': isDrawerOpen }">
      <div v-if="selectedShop" class="drawer-content">
        <header class="drawer-header">
          <div class="drawer-header-info">
            <img :src="selectedShop.image || selectedShop.logo || 'https://placehold.co/60x60?text=Shop'" class="drawer-logo" />
            <div>
              <h2>{{ selectedShop.name }}</h2>
              <span :class="['status-pill', selectedShop.isEnabled !== false ? 'status--active' : 'status--disabled']">
                {{ selectedShop.isEnabled !== false ? 'Active' : 'Disabled' }}
              </span>
            </div>
          </div>
          <button @click="closeDrawer" class="btn-close">&times;</button>
        </header>

        <div class="drawer-body">
          <section class="drawer-section">
            <label>Unique ID</label>
            <p class="selectable-text"><code>{{ selectedShop.id }}</code></p>
          </section>

          <section class="drawer-section">
            <label>Owners</label>
            <p>{{ getOwnerEmails(selectedShop.ownerEmail) }}</p>
          </section>

          <section class="drawer-section">
            <label>Location</label>
            <p>{{ selectedShop.address || 'No address provided' }}</p>
            <p v-if="selectedShop.city"><strong>City:</strong> {{ selectedShop.city }}</p>
            <div v-if="selectedShop.mapLocation" class="mt-1">
              <a :href="selectedShop.mapLocation" target="_blank" class="btn btn--secondary btn--small map-badge">
                📍 View Map
              </a>
            </div>
          </section>

          <section class="drawer-section" v-if="selectedShop.phoneNumber || selectedShop.whatsappNumber || selectedShop.phone">
            <label>Contact Info</label>
            <p v-if="selectedShop.phoneNumber"><strong>📞 Phone:</strong> {{ selectedShop.phoneCode }} {{ selectedShop.phoneNumber }}</p>
            <p v-else-if="selectedShop.phone"><strong>📞 Phone:</strong> {{ selectedShop.phone }}</p>
            
            <p v-if="selectedShop.whatsappNumber"><strong>💬 WhatsApp:</strong> {{ selectedShop.whatsappCode }} {{ selectedShop.whatsappNumber }}</p>
          </section>

          <section class="drawer-section" v-if="selectedShop.cat && selectedShop.cat.length">
            <label>Categories</label>
            <div class="category-tags">
              <span v-for="cat in selectedShop.cat" :key="cat" class="tag">{{ cat }}</span>
            </div>
          </section>

          <section class="drawer-section" v-if="selectedShop.isEnabled === false">
            <label>Disabled Message</label>
            <p class="alert alert--warning">{{ selectedShop.disabledMessage || 'Standard closure message.' }}</p>
          </section>
        </div>

        <footer class="drawer-footer">
          <button @click="goToManageItems(selectedShop.id)" class="btn btn--primary flex-1">📦 Manage Menu Items</button>
          <button @click="goToEditShop(selectedShop.id)" class="btn btn--outline">✏️ Edit Shop</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem 1rem;
  background: var(--bg-body);
  min-height: 100vh;
}

.container--wide {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1rem;
}

.header-main h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.admin-toolbar {
  padding: 0 0 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.search-bar {
  flex: 1;
  max-width: 450px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.8rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
}

.stats {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.stats strong {
  color: var(--primary-color);
  font-size: 1.4rem;
}

/* Shop Grid */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.shop-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-color);
}

.shop-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.shop-card__image {
  height: 140px;
  position: relative;
  background: #f8f9fa;
}

.shop-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-card__image .status-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.status-pill {
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.status--active {
  background: #28a745;
  color: white;
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
}

.status--disabled {
  background: #6c757d;
  color: white;
  box-shadow: 0 2px 6px rgba(108, 117, 125, 0.3);
}

.shop-card__content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  color: var(--text-main);
}

.shop-location {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.shop-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--text-muted), transparent 40%);
  margin-bottom: 1.25rem;
}

.shop-card__actions {
  margin-top: auto;
  display: flex;
  gap: 0.6rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.drawer-overlay.open {
  opacity: 1;
  visibility: visible;
}

.shop-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 600px;
  left: 50%;
  transform: translate(-50%, 100%);
  background: var(--bg-card);
  z-index: 1001;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.shop-drawer.open {
  transform: translate(-50%, 0);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);
}

.drawer-header-info {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.drawer-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.drawer-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.4rem;
}

.btn-close {
  background: var(--bg-body);
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-muted);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.drawer-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.drawer-section {
  margin-bottom: 1.5rem;
}

.drawer-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.selectable-text code {
  background: var(--bg-body);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 1rem;
}

.tag {
  display: inline-block;
  background: var(--bg-body);
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.alert--warning {
  background: rgba(255, 193, 7, 0.1);
  color: #856404;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #ffc107;
}

.drawer-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  background: var(--bg-body);
}

.spinner {
  display: inline-block;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .admin-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .shop-drawer {
    max-width: 100%;
    left: 0;
    transform: translateY(100%);
    border-radius: 24px 24px 0 0;
  }
  
  .shop-drawer.open {
    transform: translateY(0);
  }
}
</style>
