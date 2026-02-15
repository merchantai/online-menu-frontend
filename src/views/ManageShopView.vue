<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import { checkShopIdAvailable } from '../api';
import { compressImage } from '../utils/image';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const hotelIdFromRoute = computed(() => route.params.hotelId);
const isEdit = computed(() => !!hotelIdFromRoute.value);

const countryCodes = [
  { code: '+91', name: 'IN' },
  { code: '+971', name: 'AE' },
  { code: '+1', name: 'US' },
  { code: '+44', name: 'UK' },
  { code: '+65', name: 'SG' },
  { code: '+966', name: 'SA' },
  { code: '+974', name: 'QA' },
  { code: '+9 om', name: 'OM' },
  { code: '+965', name: 'KW' },
  { code: '+973', name: 'BH' },
];

const formData = ref({
  shopId: '',
  name: '',
  city: '',
  address: '',
  phoneCode: '+91',
  phoneNumber: '',
  whatsappCode: '+91',
  whatsappNumber: '',
  mapLocation: '',
  ownerEmail: '',
  cat: [],
  isEnabled: true,
  disabledMessage: '',
  image: null
});

const categoriesInput = ref('');
const ownersInput = ref('');
const imageFile = ref(null);
const imagePreview = ref(null);
const isCompressing = ref(false);
const isSaving = ref(false);
const shopIdError = ref('');
const isCheckingId = ref(false);

const validateShopId = async () => {
  if (isEdit.value) return; // No validation needed for edit mode (ID can't simplify change)
  const id = formData.value.shopId;
  shopIdError.value = '';
  
  if (!id) return;
  
  // Basic regex check first
  const idRegex = /^[a-z0-9\-]+$/;
  if (!idRegex.test(id)) {
    shopIdError.value = "Shop ID must be lowercase alphanumeric with hyphens only.";
    return;
  }
  
  try {
    isCheckingId.value = true;
    const isAvailable = await checkShopIdAvailable(id);
    if (!isAvailable) {
      shopIdError.value = "This Shop ID is already taken. Please choose another.";
    }
  } catch (error) {
    console.error("Failed to check ID availability:", error);
  } finally {
    isCheckingId.value = false;
  }
};

const init = async () => {
  if (isEdit.value) {
    const targetId = hotelIdFromRoute.value;
    
    // Ensure we have hotels list
    if (menuStore.allHotels.length === 0) {
      await menuStore.fetchAllHotels(true);
    }
    
    let shop = menuStore.allHotels.find(h => h.id === targetId);
    
    // Fallback: If not in list, fetch individual
    if (!shop) {
       try {
         await menuStore.fetchHotelAndMenu(targetId);
         shop = menuStore.hotel;
       } catch (e) {
         console.error("❌ Failed to fetch individual shop:", e);
       }
    }

    if (shop) {
      loadShop(shop);
    } else {
      console.warn("⚠️ Shop not found in list or individual fetch for ID:", targetId);
      // Wait a bit to see if Pinia caught up or if it's really missing
      setTimeout(() => {
        if (!shop && isEdit.value) {
          router.push('/admin');
        }
      }, 2000);
    }
  } else {
    // Reset form for "Add Shop" mode
    formData.value = {
      shopId: '',
      name: '',
      city: '',
      address: '',
      phoneCode: '+91',
      phoneNumber: '',
      whatsappCode: '+91',
      whatsappNumber: '',
      mapLocation: '',
      ownerEmail: '',
      cat: [],
      isEnabled: true,
      disabledMessage: '',
      image: null
    };
    categoriesInput.value = '';
    ownersInput.value = '';
    imagePreview.value = null;
  }
};

onMounted(init);

// Watch for route ID changes in case component is reused
watch(hotelIdFromRoute, () => {
  init();
});

const loadShop = (shop) => {
  formData.value = { 
    ...shop,
    shopId: shop.id,
    isEnabled: shop.isEnabled !== false,
    phoneCode: shop.phoneCode || '+91',
    phoneNumber: shop.phoneNumber || (shop.phone ? String(shop.phone).replace(/^\+\d+\s?/, '') : ''),
    whatsappCode: shop.whatsappCode || '+91',
    whatsappNumber: shop.whatsappNumber || (shop.whatsapp ? String(shop.whatsapp).replace(/^\+\d+\s?/, '') : ''),
  };
  categoriesInput.value = Array.isArray(shop.cat) ? shop.cat.join(', ') : shop.cat || '';
  ownersInput.value = Array.isArray(shop.ownerEmail) ? shop.ownerEmail.join(', ') : shop.ownerEmail || '';
  imagePreview.value = shop.image || shop.logo;
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      isCompressing.value = true;
      const compressed = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.7 });
      imageFile.value = compressed;
      imagePreview.value = URL.createObjectURL(compressed);
    } catch (error) {
      console.error("Compression failed:", error);
      imageFile.value = file;
      imagePreview.value = URL.createObjectURL(file);
    } finally {
      isCompressing.value = false;
    }
  }
};

const handleSubmit = async () => {
  try {
    isSaving.value = true;
    
    const cat = categoriesInput.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== '');

    const ownerEmail = ownersInput.value
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e !== '');

    // Construct full phone numbers for legacy compatibility
    const phone = `${formData.value.phoneCode} ${formData.value.phoneNumber}`.trim();
    const whatsapp = `${formData.value.whatsappCode} ${formData.value.whatsappNumber}`.trim();

    const data = {
      ...formData.value,
      cat,
      ownerEmail,
      phone,
      whatsapp
    };

    // Remove shopId from the data object as it's the document ID
    const { shopId, ...saveData } = data;

    if (isEdit.value) {
      await menuStore.updateShop(hotelIdFromRoute.value, saveData, imageFile.value);
    } else {
      if (!shopId) throw new Error("Shop ID is required for new shops");
      // Validate shopId (no spaces, special chars)
      const idRegex = /^[a-z0-9\-]+$/;
      if (!idRegex.test(shopId)) throw new Error("Shop ID must be lowercase alphanumeric with hyphens only.");
      
      await menuStore.addShop(saveData, imageFile.value, shopId);
    }
    
    router.push('/admin');
  } catch (error) {
    alert("Save failed: " + error.message);
  } finally {
    isSaving.value = false;
  }
};

const openMapPicker = () => {
  // Simple helper to open Google Maps to find coordinates/link
  window.open("https://www.google.com/maps", "_blank");
};
</script>

<template>
  <div class="manage-view">
    <div class="container--narrow">
      <header class="manage-header">
        <button @click="router.back()" class="btn btn--icon btn--outline">←</button>
        <h1>{{ isEdit ? 'Edit Shop' : 'Add New Shop' }}</h1>
      </header>

      <form @submit.prevent="handleSubmit" class="manage-form card">
        <!-- Shop ID (Only on Add) -->
        <div class="form-group">
          <label>Shop ID (Unique Permalink)</label>
            <div class="input-with-prefix">
            <span class="prefix">promenu.in/</span>
            <input 
              v-model="formData.shopId" 
              :disabled="isEdit" 
              required 
              class="form-input" 
              placeholder="e.g. grand-plaza" 
              @blur="validateShopId"
              @input="shopIdError = ''"
            />
            <span v-if="isCheckingId" class="input-spinner">⏳</span>
          </div>
          <p class="error-text" v-if="shopIdError">{{ shopIdError }}</p>
          <p class="help-text" v-if="!isEdit && !shopIdError">This will be the URL of your shop. <strong>Cannot be changed later.</strong></p>
          <p class="help-text" v-else-if="isEdit">ID cannot be modified after creation.</p>
        </div>

        <!-- Basic Info -->
        <div class="form-group">
          <label>Shop Name</label>
          <input v-model="formData.name" required class="form-input" placeholder="e.g. Grand Plaza" />
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label>City</label>
            <input v-model="formData.city" required class="form-input" placeholder="e.g. New York" />
          </div>
        </div>

        <div class="form-group">
          <label>Full Address</label>
          <textarea v-model="formData.address" class="form-input" placeholder="Full street address"></textarea>
        </div>

        <!-- Contact Info -->
        <div class="form-row">
          <div class="form-group flex-1">
            <label>Phone Number</label>
            <div class="phone-input-group">
              <select v-model="formData.phoneCode" class="form-input code-select">
                <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.name }} ({{ c.code }})</option>
              </select>
              <input v-model="formData.phoneNumber" type="tel" class="form-input" placeholder="1234567890" />
            </div>
          </div>
          <div class="form-group flex-1">
            <label>WhatsApp Number</label>
            <div class="phone-input-group">
              <select v-model="formData.whatsappCode" class="form-input code-select">
                <option v-for="c in countryCodes" :key="c.code" :value="c.code">{{ c.name }} ({{ c.code }})</option>
              </select>
              <input v-model="formData.whatsappNumber" type="tel" class="form-input" placeholder="1234567890" />
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="form-group">
          <label>Google Maps Location (URL or Coordinates)</label>
          <div class="input-action-group">
            <input v-model="formData.mapLocation" class="form-input" placeholder="Paste Google Maps link or Lat,Lng" />
            <button type="button" @click="openMapPicker" class="btn btn--secondary btn--icon" title="Find on Map">📍</button>
          </div>
          <p class="help-text">Search for your shop on Maps and paste the link here.</p>
        </div>

        <!-- Admin Info -->
        <div class="form-group">
          <label>Owner Email(s) (comma separated)</label>
          <input v-model="ownersInput" required placeholder="owner@example.com, manager@example.com" class="form-input" />
          <p class="help-text">These users can manage shop items.</p>
        </div>

        <div class="form-group">
          <label>Categories (comma separated)</label>
          <input v-model="categoriesInput" placeholder="Restaurant, Bakery, Dessert" class="form-input" />
        </div>

        <!-- Availability Toggle -->
        <div class="form-group row-inline">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.isEnabled" />
            <span>Shop Enabled (Visible in Discovery)</span>
          </label>
        </div>

        <div v-if="!formData.isEnabled" class="form-group">
          <label>Disabled Message</label>
          <input v-model="formData.disabledMessage" class="form-input" placeholder="e.g. We are closed for renovation." />
        </div>

        <!-- Image -->
        <div class="form-group">
          <label>Branding Image</label>
          <div class="mb-2">
            <input v-model="formData.image" placeholder="Paste Logo URL" class="form-input" />
          </div>
          <div class="file-input-wrapper">
             <span class="text-sm text-muted">OR Upload</span>
             <input type="file" @change="handleFileChange" accept="image/*" class="form-input mt-1" :disabled="isCompressing" />
          </div>
          
          <div v-if="imagePreview || formData.image" class="image-preview-container">
            <div class="image-preview shop-logo-preview">
               <img :src="imagePreview || formData.image" alt="Shop Preview" />
            </div>
          </div>
        </div>

        <div class="form-actions mt-2">
          <button type="button" @click="router.back()" class="btn btn--secondary">Cancel</button>
          <button type="submit" class="btn btn--primary" :disabled="isSaving || isCompressing || !!shopIdError">
            {{ isSaving ? 'Saving...' : (isEdit ? 'Update Shop' : 'Create Shop') }}
          </button>
        </div>

        <!-- Debug Info (Only visible in dev) -->
        <pre v-if="false" style="font-size: 10px; margin-top: 2rem; opacity: 0.5;">{{ JSON.stringify(formData, null, 2) }}</pre>
      </form>
    </div>
  </div>
</template>

<style scoped>
.manage-view {
  padding: 2rem 1rem;
  background: var(--bg-body);
  min-height: 100vh;
}

.manage-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-with-prefix {
  display: flex;
  align-items: center;
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.input-with-prefix .prefix {
  padding: 0 1rem;
  background: var(--border-color);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.input-with-prefix input {
  border: none;
  flex: 1;
  padding: 0.8rem;
  outline: none;
  background: transparent;
  color: var(--text-main);
}

.phone-input-group {
  display: flex;
  gap: 0.5rem;
}

.code-select {
  width: 100px;
  flex-shrink: 0;
}

.input-action-group {
  display: flex;
  gap: 0.5rem;
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.row-inline {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--primary-color);
}

.shop-logo-preview {
  height: 120px;
  width: 120px;
  border-radius: 12px;
  margin-top: 1rem;
}

.image-preview-container {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

.error-text {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.input-spinner {
  padding: 0 0.5rem;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
