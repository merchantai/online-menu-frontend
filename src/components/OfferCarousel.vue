<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const activeIndex = ref(0);

const next = () => {
  activeIndex.value = (activeIndex.value + 1) % props.images.length;
};

const prev = () => {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length;
};

// Simple auto-advance could be added, but for a popup user control is often better.
// Let's stick to manual navigation for now unless requested.
</script>

<template>
  <div v-if="isOpen && images.length > 0" class="carousel-overlay" @click.self="$emit('close')">
    <div class="carousel-container">
      <button class="btn-close-carousel" @click="$emit('close')">&times;</button>
      
      <div class="carousel-slide">
         <img :src="images[activeIndex]" alt="Offer" class="carousel-image" />
      </div>

      <!-- Navigation Arrows (only if > 1 image) -->
      <template v-if="images.length > 1">
        <button class="nav-btn prev" @click="prev">‹</button>
        <button class="nav-btn next" @click="next">›</button>

        <!-- Indicators -->
        <div class="indicators">
           <span 
             v-for="(_, index) in images" 
             :key="index" 
             class="indicator-dot"
             :class="{ active: index === activeIndex }"
             @click="activeIndex = index"
           ></span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.carousel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85); /* Darker background for focus */
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.carousel-container {
  position: relative;
  width: 100%;
  max-width: 600px; /* Max width for banner feel */
  aspect-ratio: 4/5; /* Taller for mobile impact, or stick to square/landscape? */ 
  /* Many food apps use portrait/square for offers. Let's try flexible or square. */
  max-height: 80vh;
  background: transparent;
  display: flex;
  flex-direction: column;
}

/* Let's make the container fit the image aspect ratio or fixed?
   Fixed is safer for layout. 1:1 or 4:5 is good for mobile.
   Let's use auto-height based on max-width, but max-height constraint.
*/
.carousel-container {
  aspect-ratio: auto;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.carousel-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.carousel-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain; /* Ensure whole offer is visible */
  display: block;
}

.btn-close-carousel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  z-index: 5;
  transition: background 0.3s;
}

.nav-btn:hover {
  background: rgba(0,0,0,0.6);
}

.prev { left: 0; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
.next { right: 0; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }

.indicators {
  position: absolute;
  bottom: 15px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  z-index: 5;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
}

.indicator-dot.active {
  background: white;
  transform: scale(1.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
