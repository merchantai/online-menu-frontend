<script setup>
import { ref, computed } from 'vue';
import { useMenuStore } from '../stores/menu';
import { compressImage } from '../utils/image';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const menuStore = useMenuStore();

const fileInput = ref(null);
const isUploading = ref(false);
const isDeleting = ref(false);

const offerImages = computed(() => {
  return menuStore.hotel?.offerImages || [];
});

const canAddMore = computed(() => {
  return offerImages.value.length < 3;
});

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    isUploading.value = true;
    
    // Compress
    const compressed = await compressImage(file, {
      maxWidth: 1200, // Offers might need better quality/width
      maxHeight: 1200,
      quality: 0.8
    });

    // Upload via store
    await menuStore.addOfferImage(compressed);
    
    // Reset input
    if (fileInput.value) fileInput.value.value = "";
  } catch (error) {
    alert("Failed to upload offer image: " + error.message);
  } finally {
    isUploading.value = false;
  }
};

const handleDelete = async (url) => {
  if (!confirm("Are you sure you want to remove this offer image?")) return;
  
  try {
    isDeleting.value = true;
    await menuStore.removeOfferImage(url);
  } catch (error) {
    alert("Failed to remove image: " + error.message);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Overlay -->
    <div v-if="isOpen" class="drawer-overlay" @click="$emit('close')"></div>
    
    <!-- Drawer -->
    <div class="bottom-drawer" :class="{ 'is-open': isOpen }">
      <div class="drawer-header-row">
         <h3>Manage Offer Banners</h3>
         <button class="drawer-close-static" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="drawer-content-scroll">
         <p class="text-sm text-muted mb-2">
           Upload up to 3 promotional images. These will appear as a popup when customers visit your shop.
         </p>

         <!-- Image List -->
         <div class="offers-grid">
            <div v-for="(img, index) in offerImages" :key="index" class="offer-preview-card">
               <img :src="img" alt="Offer Banner" />
               <button @click="handleDelete(img)" class="btn-delete-overlay" :disabled="isDeleting">
                  &times;
               </button>
            </div>

            <!-- Add Button / Placeholder -->
            <div v-if="canAddMore" class="offer-upload-card" @click="$refs.fileInput.click()">
               <span v-if="isUploading" class="spinner">⏳</span>
               <span v-else>+ Add Banner</span>
               <input 
                 ref="fileInput" 
                 type="file" 
                 accept="image/*" 
                 class="hidden-input"
                 @change="handleFileChange"
                 :disabled="isUploading"
               />
            </div>
         </div>
         
         <div v-if="!canAddMore" class="text-xs text-warning mt-2">
           Max 3 offers allowed. Remove one to add another.
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.drawer-header-row h3 {
 margin: 0;
 font-size: 1.2rem;
}

.drawer-close-static {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-muted);
}

.drawer-content-scroll {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 60vh;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.offer-preview-card {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.offer-preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-delete-overlay {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.offer-upload-card {
  aspect-ratio: 16/9;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--primary-color);
  font-weight: 500;
  background: var(--bg-body);
  transition: all 0.2s;
}

.offer-upload-card:hover {
  background: var(--bg-card);
  border-color: var(--primary-color);
}

.hidden-input {
  display: none;
}

.text-warning {
  color: #f59e0b;
}

.spinner {
  animation: rotate 1s linear infinite;
  display: inline-block;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
