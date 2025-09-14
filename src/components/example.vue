<script setup>
import { ref, onMounted } from "vue";
import {
  login,
  logout,
  watchAuthState,
  loadHotel,
  isAdmin,
  getMenuItems,
  addMenuItem
} from "../api";

const hotelId = "hotel123";
const menu = ref([]);
const user = ref(null);
const admin = ref(false);

onMounted(async () => {
  watchAuthState(async (u) => {
    user.value = u;
    if (u) {
      await loadHotel(hotelId);
      admin.value = isAdmin();
    }
  });

  menu.value = await getMenuItems(hotelId);
});

async function handleLogin() {
  await login();
}

async function handleAdd() {
  if (!admin.value) return alert("You are not authorized");
  await addMenuItem(hotelId, { name: "New Dish", price: 100, category: "Main" });
  menu.value = await getMenuItems(hotelId);
}
</script>

<template>
  <div>
    <button @click="handleLogin">Login with Google</button>
    <div v-if="admin">
      <button @click="handleAdd">Add Item</button>
    </div>

    <ul>
      <li v-for="item in menu" :key="item.id">
        {{ item.name }} - {{ item.price }}
      </li>
    </ul>
  </div>
</template>