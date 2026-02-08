<script setup>
import { ref, watch } from 'vue';
import { compressImage } from '../utils/image';

const props = defineProps({
  item: Object,
  isOpen: Boolean
});

const emit = defineEmits(['save', 'cancel']);

const formData = ref({
  name: '',
  price: '',
  description: '',
  image: null
});
const imageFile = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);
const isCompressing = ref(false);

watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.value = { ...newItem };
    imagePreview.value = newItem.image;
    imageFile.value = null; // Reset file input
    if (fileInput.value) fileInput.value.value = "";
  } else {
    // Reset for new item
    formData.value = { name: '', price: '', description: '', image: null };
    imagePreview.value = null;
    imageFile.value = null;
    if (fileInput.value) fileInput.value.value = "";
  }
}, { immediate: true });

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
      // Fallback to original file
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

const handleSubmit = () => {
  emit('save', {
    ...formData.value,
    file: imageFile.value
  });
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <div class="modal__header">
        <h2>{{ item ? 'Edit Item' : 'Add New Item' }}</h2>
        <button @click="$emit('cancel')" class="btn-close">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label>Name</label>
          <input v-model="formData.name" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Price</label>
          <input v-model.number="formData.price" type="number" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="formData.description" class="form-input"></textarea>
        </div>

        <div class="form-group">
          <label>Image Source</label>
          
          <!-- URL Input -->
          <div class="mb-2">
            <input v-model="formData.image" placeholder="Paste Image URL (https://...)" class="form-input" />
          </div>

          <!-- File Input -->
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
          
          <!-- Preview -->
          <div v-if="imagePreview || formData.image" class="image-preview-container">
            <div class="image-preview">
               <img :src="imagePreview || formData.image" alt="Preview" @error="$event.target.style.display='none'" />
            </div>
            <button type="button" @click="removeImage" class="btn btn--small btn--danger mt-2" :disabled="isCompressing">Remove Image</button>
          </div>
        </div>

        <div class="modal__actions">
          <button type="button" @click="$emit('cancel')" class="btn btn--secondary">Cancel</button>
          <button type="submit" class="btn btn--primary" :disabled="isCompressing">
            {{ isCompressing ? 'Processing Image...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.compression-loader {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.text-success {
  color: #28a745;
}

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
.mt-2 { margin-top: 0.5rem; }
.text-sm { font-size: 0.875rem; }
.text-muted { color: var(--text-muted); }
.text-primary { color: var(--primary-color); }
</style>
