<script setup>
import { ref, watch } from 'vue';

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

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
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
             <span class="text-sm text-muted">OR Upload File (Requires Firebase Storage)</span>
             <input ref="fileInput" type="file" @change="handleFileChange" accept="image/*" class="form-input mt-1" />
          </div>
          
          <!-- Preview -->
          <div v-if="imagePreview || formData.image" class="image-preview-container">
            <div class="image-preview">
               <img :src="imagePreview || formData.image" alt="Preview" @error="$event.target.style.display='none'" />
            </div>
            <button type="button" @click="removeImage" class="btn btn--small btn--danger mt-2">Remove Image</button>
          </div>
        </div>

        <div class="modal__actions">
          <button type="button" @click="$emit('cancel')" class="btn btn--secondary">Cancel</button>
          <button type="submit" class="btn btn--primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Modal styles will be in global css for simplicity or scoped here */
</style>
