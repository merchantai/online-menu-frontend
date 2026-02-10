<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMenuStore } from '../stores/menu';
import { getStoreUrl } from '../utils/domain';

const menuStore = useMenuStore();
const stores = computed(() => menuStore.allHotels);
const loading = computed(() => menuStore.loading);
const searchQuery = ref('');
const collapsedCategories = ref(new Set());
const isRegistrationModalOpen = ref(false);

onMounted(async () => {
  await menuStore.fetchAllHotels();
});

const filteredStores = computed(() => {
  if (!searchQuery.value) return stores.value;
  const query = searchQuery.value.toLowerCase();
  return stores.value.filter(store => 
    store.name.toLowerCase().includes(query) || 
    (store.city && store.city.toLowerCase().includes(query)) ||
    (store.address && store.address.toLowerCase().includes(query))
  );
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
  const message = encodeURIComponent("Hello! I'm interested in adding my shop to MerchantAI.");
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

const contactViaEmail = () => {
  if (!adminEmail) return;
  const subject = encodeURIComponent("Inquiry: Registering my shop on MerchantAI");
  const body = encodeURIComponent("Hello,\n\nI would like to know more about listing my shop on your platform.");
  window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
};
</script>

<template>
  <div class="landing-page">
    <div class="container--narrow">
      <header class="landing-header">
        <h1>MerchantAI</h1>
        <p>Your portal to local shopping & dining</p>
      </header>

      <div class="search-section card">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            placeholder="Search shops by name or city..." 
            class="search-input"
          />
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
            <p>Join MerchantAI and take your restaurant or grocery store online today!</p>
            
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

.search-section {
  padding: 0.75rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.search-bar {
  position: relative;
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 50px;
  background: var(--bg-body);
  color: var(--text-main);
  font-size: 1rem;
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
