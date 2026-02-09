<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import { compressImage } from '../utils/image';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const itemId = route.params.itemId;
const isEdit = !!itemId;

const currencies = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' }
];

const formData = ref({
  name: '',
  price: '',
  description: '',
  image: null,
  cat: [],
  currency: 'INR',
  quantityType: 'unit'
});

const categoriesInput = ref('');
const imageFile = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);
const isCompressing = ref(false);
const isSaving = ref(false);

onMounted(async () => {
  if (isEdit) {
    // Wait for store to be ready if needed, or find in existing list
    const item = menuStore.menuItems.find(i => i.id === itemId);
    if (item) {
      loadItem(item);
    } else {
      // If not in store (e.g. direct link), we'd usually fetch from API
      // For now, let's just go back if not found or implement a fetch
      router.push('/');
    }
  }
});

const loadItem = (item) => {
  formData.value = { 
    ...item,
    currency: item.currency || 'INR',
    quantityType: item.quantityType || 'unit'
  };
  categoriesInput.value = Array.isArray(item.cat) ? item.cat.join(', ') : item.cat || '';
  imagePreview.value = item.image;
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      isCompressing.value = true;
      const compressed = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.7
      });
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

const removeImage = () => {
  imagePreview.value = null;
  formData.value.image = null;
  imageFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const handleSubmit = async () => {
  try {
    isSaving.value = true;
    const cat = categoriesInput.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== '');

    const data = {
      ...formData.value,
      cat,
      file: imageFile.value
    };

    if (isEdit) {
      const { file, ...updates } = data;
      await menuStore.updateItem(itemId, updates, file);
    } else {
      const { file, ...newItem } = data;
      await menuStore.addItem(newItem, file);
    }
    
    router.push('/');
  } catch (error) {
    alert("Save failed: " + error.message);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="manage-view">
    <div class="container--narrow">
      <header class="manage-header">
        <button @click="router.back()" class="btn btn--icon btn--outline">←</button>
        <h1>{{ isEdit ? 'Edit Menu Item' : 'Add New Menu Item' }}</h1>
      </header>

      <form @submit.prevent="handleSubmit" class="manage-form card">
        <div class="form-group">
          <label>Item Name</label>
          <input v-model="formData.name" required class="form-input" placeholder="e.g. Butter Chicken" />
        </div>

        <div class="form-row">
          <div class="form-group flex-2">
            <label>Price per {{ formData.quantityType === 'unit' ? 'item' : formData.quantityType }}</label>
            <input v-model.number="formData.price" type="number" required class="form-input" placeholder="0.00" />
          </div>
          <div class="form-group flex-1">
            <label>Currency</label>
            <select v-model="formData.currency" class="form-input">
              <option v-for="c in currencies" :key="c.code" :value="c.code">
                {{ c.code }} ({{ c.symbol }})
              </option>
            </select>
          </div>
          <div class="form-group flex-1">
            <label>Quantity Type</label>
            <select v-model="formData.quantityType" class="form-input">
              <option value="unit">Unit (Default)</option>
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="formData.description" class="form-input" placeholder="Ingredients, spice level, etc."></textarea>
        </div>

        <div class="form-group">
          <label>Categories (comma separated)</label>
          <input v-model="categoriesInput" placeholder="e.g. Starter, Veg, Chinese" class="form-input" />
        </div>

        <div class="form-group">
          <label>Image Source</label>
          <div class="mb-2">
            <input v-model="formData.image" placeholder="Paste Image URL (https://...)" class="form-input" />
          </div>

          <div class="file-input-wrapper">
             <span class="text-sm text-muted">OR Upload File</span>
             <input 
               ref="fileInput" 
               type="file" 
               @change="handleFileChange" 
               accept="image/*" 
               class="form-input mt-1" 
               :disabled="isCompressing"
             />
             <div v-if="isCompressing" class="compression-loader">
                <span class="spinner">⏳</span> Compressing & Optimizing...
             </div>
             <div v-else-if="imageFile" class="text-sm text-success mt-1">
                ✅ Image optimized (WebP)
             </div>
          </div>
          
          <div v-if="imagePreview || formData.image" class="image-preview-container">
            <div class="image-preview">
               <img :src="imagePreview || formData.image" alt="Preview" @error="$event.target.style.display='none'" />
            </div>
            <button type="button" @click="removeImage" class="btn btn--small btn--danger mt-2" :disabled="isCompressing">Remove Image</button>
          </div>
        </div>

        <div class="form-actions mt-2">
          <button type="button" @click="router.back()" class="btn btn--secondary">Cancel</button>
          <button type="submit" class="btn btn--primary" :disabled="isSaving || isCompressing">
            {{ isSaving ? 'Saving...' : (isEdit ? 'Update Item' : 'Add Item') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.manage-view {
  padding: 2rem 1rem;
  background-color: var(--bg-body);
  min-height: calc(100vh - 70px);
}

.manage-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.manage-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.manage-form {
  padding: 2rem;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

.container--narrow {
  max-width: 600px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* Compression UI Styles */
.compression-loader {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.text-success { color: #28a745; }

.spinner {
  display: inline-block;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mb-2 { margin-bottom: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 1.5rem; }
.text-sm { font-size: 0.875rem; }
.text-muted { color: var(--text-muted); }

@media (max-width: 600px) {
  .manage-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
