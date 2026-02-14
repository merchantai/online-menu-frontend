import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { 
  getAllHotels,
  loadHotel, 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  addHotel,
  updateHotel,
  deleteHotel,
  isPlatformAdmin as apiIsPlatformAdmin
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
  const hotelCache = ref({}); 

  const userStore = useUserStore();

  const isPlatformAdmin = computed(() => {
    return userStore.user ? apiIsPlatformAdmin() : false;
  });

  const isAdmin = computed(() => {
    if (!userStore.user) return false;
    if (isPlatformAdmin.value) return true;
    if (!hotel.value) return false;

    const userEmail = userStore.user.email.toLowerCase();
    const owners = hotel.value.ownerEmail || [];
    if (Array.isArray(owners)) {
      return owners.map(e => e.toLowerCase()).includes(userEmail);
    }
    return owners.toLowerCase() === userEmail;
  });

  const fetchAllHotels = async (force = false) => {
    const now = Date.now();
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

  // ---- SHOP ACTIONS (PLATFORM ADMIN) ----
  const addShop = async (shopData, file, customId = null) => {
    loading.value = true;
    try {
      const newShop = await addHotel(shopData, file, customId);
      allHotels.value.push(newShop);
      return newShop;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateShop = async (hotelId, updates, file) => {
    loading.value = true;
    try {
      await updateHotel(hotelId, updates, file);
      const index = allHotels.value.findIndex(h => h.id === hotelId);
      if (index !== -1) {
        allHotels.value[index] = { ...allHotels.value[index], ...updates };
      }
      // Clear cache for this hotel
      delete hotelCache.value[hotelId];
      if (hotel.value && hotel.value.id === hotelId) {
        hotel.value = { ...hotel.value, ...updates };
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteShop = async (hotelId) => {
    loading.value = true;
    try {
      await deleteHotel(hotelId);
      allHotels.value = allHotels.value.filter(h => h.id !== hotelId);
      delete hotelCache.value[hotelId];
      if (hotel.value && hotel.value.id === hotelId) {
        hotel.value = null;
        menuItems.value = [];
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchHotelAndMenu = async (hotelId, force = false) => {
    const now = Date.now();
    const cached = hotelCache.value[hotelId];
    
    if (!force && cached && (now - cached.timestamp < 10 * 60 * 1000)) {
       hotel.value = cached.data;
       menuItems.value = cached.menu;
       return;
    }

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
      const [hotelData, items] = await Promise.all([
        loadHotel(hotelId),
        getMenuItems(hotelId)
      ]);

      hotel.value = hotelData;
      menuItems.value = items;

      hotelCache.value[hotelId] = {
        data: hotelData,
        menu: items,
        timestamp: now
      };

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
    isPlatformAdmin,
    fetchAllHotels,
    fetchHotelAndMenu,
    addShop,
    updateShop,
    deleteShop,
    addItem,
    updateItem,
    deleteItem
  };
});
