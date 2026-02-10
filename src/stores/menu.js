import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { 
  getAllHotels,
  loadHotel, 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from "../api";
import { useUserStore } from "./user";

export const useMenuStore = defineStore("menu", () => {
  const hotel = ref(null);
  const allHotels = ref([]);
  const menuItems = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  // Cache timestamps
  const lastFetchedAll = ref(0);
  const hotelCache = ref({}); // { [hotelId]: { data, menu, timestamp } }

  const userStore = useUserStore();

  const isAdmin = computed(() => {
    if (!userStore.user || !hotel.value) return false;
    // Handle both string and array ownerEmail
    const owners = hotel.value.ownerEmail || [];
    return Array.isArray(owners) ? owners.includes(userStore.user.email) : owners === userStore.user.email;
  });

  const fetchAllHotels = async (force = false) => {
    const now = Date.now();
    // Cache for 5 minutes
    if (!force && allHotels.value.length > 0 && (now - lastFetchedAll.value < 5 * 60 * 1000)) {
      return allHotels.value;
    }

    loading.value = true;
    try {
      allHotels.value = await getAllHotels();
      lastFetchedAll.value = now;
    } catch (err) {
      console.error("Error fetching all hotels:", err);
    } finally {
      loading.value = false;
    }
    return allHotels.value;
  };

  const fetchHotelAndMenu = async (hotelId, force = false) => {
    const now = Date.now();
    const cached = hotelCache.value[hotelId];
    
    // If we have valid cache (under 10 mins) and not forcing, use it
    if (!force && cached && (now - cached.timestamp < 10 * 60 * 1000)) {
       hotel.value = cached.data;
       menuItems.value = cached.menu;
       return;
    }

    // Try to load from localStorage for immediate UI if cache is empty
    if (!cached) {
      const persisted = localStorage.getItem(`cache_hotel_${hotelId}`);
      if (persisted) {
        try {
          const { data, menu } = JSON.parse(persisted);
          hotel.value = data;
          menuItems.value = menu;
        } catch (e) {
          localStorage.removeItem(`cache_hotel_${hotelId}`);
        }
      }
    }

    loading.value = true;
    error.value = null;
    try {
      // Parallel fetch for speed
      const [hotelData, items] = await Promise.all([
        loadHotel(hotelId),
        getMenuItems(hotelId)
      ]);

      hotel.value = hotelData;
      menuItems.value = items;

      // Update Cache
      hotelCache.value[hotelId] = {
        data: hotelData,
        menu: items,
        timestamp: now
      };

      // Persist for offline/refresh starting
      localStorage.setItem(`cache_hotel_${hotelId}`, JSON.stringify({ data: hotelData, menu: items }));

    } catch (err) {
      console.error("Error fetching hotel data:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addItem = async (item, file) => {
    if (!hotel.value) return;
    try {
      const newItem = await addMenuItem(hotel.value.id, item, file);
      menuItems.value.push(newItem);
      // Update cache
      if (hotelCache.value[hotel.value.id]) {
        hotelCache.value[hotel.value.id].menu = [...menuItems.value];
      }
    } catch (err) {
      throw err;
    }
  };

  const updateItem = async (itemId, updates, file) => {
    if (!hotel.value) return;
    try {
      await updateMenuItem(hotel.value.id, itemId, updates, file);
      const index = menuItems.value.findIndex(i => i.id === itemId);
      if (index !== -1) {
        menuItems.value[index] = { ...menuItems.value[index], ...updates };
        if (hotelCache.value[hotel.value.id]) {
           hotelCache.value[hotel.value.id].menu = [...menuItems.value];
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteItem = async (itemId) => {
    if (!hotel.value) return;
    try {
      await deleteMenuItem(hotel.value.id, itemId);
      menuItems.value = menuItems.value.filter((i) => i.id !== itemId);
      if (hotelCache.value[hotel.value.id]) {
        hotelCache.value[hotel.value.id].menu = [...menuItems.value];
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    hotel,
    allHotels,
    menuItems,
    loading,
    error,
    isAdmin,
    fetchAllHotels,
    fetchHotelAndMenu,
    addItem,
    updateItem,
    deleteItem
  };
});
