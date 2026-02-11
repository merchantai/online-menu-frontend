<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMenuStore } from '../stores/menu';
import { getStoreUrl } from '../utils/domain';

const menuStore = useMenuStore();
const stores = computed(() => menuStore.allHotels);
const loading = computed(() => menuStore.loading);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedLocation = ref('');
const collapsedCategories = ref(new Set());
const isRegistrationModalOpen = ref(false);

onMounted(async () => {
  await menuStore.fetchAllHotels();
});

const availableCategories = computed(() => {
  const cats = new Set();
  stores.value.forEach(store => {
    let storeCats = store.cat || [];
    if (typeof storeCats === 'string') {
      storeCats = storeCats.split(',').map(c => c.trim()).filter(c => c !== '');
    }
    storeCats.forEach(c => cats.add(c));
  });
  return Array.from(cats).sort();
});

const availableLocations = computed(() => {
  const locs = new Set();
  stores.value.forEach(store => {
    if (store.city) locs.add(store.city);
  });
  return Array.from(locs).sort();
});

const filteredStores = computed(() => {
  return stores.value.filter(store => {
    const matchesName = !searchQuery.value || store.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Check categories
    let storeCats = store.cat || [];
    if (typeof storeCats === 'string') {
      storeCats = storeCats.split(',').map(c => c.trim()).filter(c => c !== '');
    }
    const matchesCategory = !selectedCategory.value || storeCats.includes(selectedCategory.value);
    
    const matchesLocation = !selectedLocation.value || store.city === selectedLocation.value;
    
    return matchesName && matchesCategory && matchesLocation;
  });
});

const categorizedStores = computed(() => {
  const categories = {};
  
  filteredStores.value.forEach(store => {
    // Robust to array or string or missing 'cat'
    let storeCats = store.cat || [];
    if (typeof storeCats === 'string') {
      storeCats = storeCats.split(',').map(c => c.trim()).filter(c => c !== '');
    }
    
    const finalCats = Array.isArray(storeCats) && storeCats.length > 0 
      ? storeCats 
      : ['General'];
      
    finalCats.forEach(cat => {
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(store);
    });
  });
  
  return Object.keys(categories).sort().map(name => ({
    name,
    items: categories[name]
  }));
});

const toggleCategory = (categoryName) => {
  if (collapsedCategories.value.has(categoryName)) {
    collapsedCategories.value.delete(categoryName);
  } else {
    collapsedCategories.value.add(categoryName);
  }
};

// Admin Contact Logic
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
const adminWhatsapp = import.meta.env.VITE_ADMIN_WHATSAPP;

const contactViaWhatsapp = () => {
  if (!adminWhatsapp) return;
  const phone = adminWhatsapp.replace(/[^\d]/g, '');
  const message = encodeURIComponent("Hello! I'm interested in adding my shop to Pro Menu.");
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

const contactViaEmail = () => {
  if (!adminEmail) return;
  const subject = encodeURIComponent("Inquiry: Registering my shop on Pro Menu");
  const body = encodeURIComponent("Hello,\n\nI would like to know more about listing my shop on your platform.");
  window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
};
</script>

<template>
  <div class="landing-page">
    <div class="container--narrow">
      <header class="landing-header">
        <h1>Pro Menu</h1>
        <p>Your portal to local shopping & dining</p>
      </header>

      <div class="search-container card">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            placeholder="Search shops..." 
            class="search-input"
          />
        </div>
        
        <div class="search-divider"></div>

        <div class="search-filter">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div class="search-divider"></div>

        <div class="search-filter">
          <select v-model="selectedLocation" class="filter-select">
            <option value="">All Locations</option>
            <option v-for="loc in availableLocations" :key="loc" :value="loc">
              {{ loc }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <span class="spinner">⏳</span> Loading shops...
      </div>

      <div v-else class="discovery-list">
        <div v-for="category in categorizedStores" :key="category.name" class="category-section">
          <div class="category-header" @click="toggleCategory(category.name)">
            <h3>{{ category.name }}</h3>
            <span class="chevron" :class="{ 'collapsed': collapsedCategories.has(category.name) }">▼</span>
          </div>

          <div v-show="!collapsedCategories.has(category.name)" class="store-grid">
            <a v-for="store in category.items" 
               :key="store.id" 
               :href="getStoreUrl(store.id)" 
               class="store-list-item card"
            >
              <div class="store-logo-container">
                <img :src="store.logo || 'https://placehold.co/100x100?text=Store'" :alt="store.name" class="store-logo" />
              </div>
              
              <div class="store-details">
                <h3 class="store-name">{{ store.name }}</h3>
                <p class="store-location">
                  <span class="city-tag">{{ store.city }}</span>
                  <span class="address-text">{{ store.address }}</span>
                </p>
              </div>
              
              <div class="store-arrow">→</div>
            </a>
          </div>
        </div>

        <div v-if="categorizedStores.length === 0" class="empty-state">
          <p>No stores found matching your search.</p>
        </div>
      </div>

      <!-- Floating Action Button -->
      <button 
        class="fab" 
        @click="isRegistrationModalOpen = true" 
        aria-label="List Your Business"
      >
        <span class="fab-icon">🏪</span>
        <span class="fab-text">List Shop</span>
      </button>

      <!-- Registration Modal -->
      <div v-if="isRegistrationModalOpen" class="modal-overlay" @click="isRegistrationModalOpen = false">
        <div class="modal card" @click.stop>
          <div class="modal-header">
            <h2>List Your Business</h2>
            <button class="btn-close" @click="isRegistrationModalOpen = false">×</button>
          </div>
          
          <div class="modal-content">
            <p>Join Pro Menu and take your restaurant or grocery store online today!</p>
            
            <div class="registration-actions">
              <button v-if="adminWhatsapp" @click="contactViaWhatsapp" class="btn btn--whatsapp">
                <span class="icon">💬</span> WhatsApp Admin
              </button>
              <button v-if="adminEmail" @click="contactViaEmail" class="btn btn--outline">
                <span class="icon">✉️</span> Email Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  padding: 3rem 1rem;
  min-height: 100vh;
  background: var(--bg-body);
}

.landing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.landing-header h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  font-weight: 800;
  letter-spacing: -1px;
}

.search-container {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 50px;
  padding: 0.25rem 0.5rem;
  margin-bottom: 2.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.search-bar {
  flex: 2;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 0.75rem;
}

.search-icon {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.search-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  color: var(--text-main);
  outline: none;
}

.search-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.search-filter {
  flex: 1;
  min-width: 120px;
}

.filter-select {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.6rem 1.5rem 0.6rem 0.5rem;
  font-size: 0.9rem;
  color: var(--text-main);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.25rem center;
  background-size: 0.8em;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
    border-radius: var(--radius);
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .search-divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }

  .search-filter {
    min-width: unset;
  }
  
  .search-bar {
    padding: 0.5rem 0.75rem;
  }
}

.category-section {
  margin-bottom: 1rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: var(--bg-card);
  border-radius: var(--radius);
  cursor: pointer;
  margin-bottom: 0.5rem;
  user-select: none;
}

.category-header h3 {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.chevron {
  font-size: 0.7rem;
  transition: transform 0.3sEase;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

.store-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-left: 0.5rem;
}

.store-list-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border-radius: var(--radius);
  text-decoration: none;
  color: inherit;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid transparent;
}

.store-list-item:hover {
  transform: translateX(4px);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.store-logo-container {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-body);
}

.store-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-details {
  flex: 1;
}

.store-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.store-location {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
}

.city-tag {
  font-weight: 600;
  color: var(--primary-color);
}

.store-arrow {
  color: var(--text-muted);
  font-weight: bold;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.spinner {
  display: inline-block;
  animation: rotate 2s linear infinite;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.fab-icon {
  font-size: 1.2rem;
}

.fab-text {
  font-weight: 700;
  font-size: 0.9rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 400px;
  padding: 0;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
}

.modal-content {
  padding: 1.5rem;
  text-align: center;
}

.modal-content p {
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.registration-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.registration-actions .btn {
  width: 100%;
  padding: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .store-name { font-size: 1rem; }
  .address-text { 
    display: none; /* Hide full address on small mobile to keep it tight */
  }
  .fab {
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.8rem;
  }
  .fab-text {
    display: none; /* Icon only on small mobile */
  }
}
</style>
