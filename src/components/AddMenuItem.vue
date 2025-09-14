<script setup>
import { ref } from "vue";
import { addMenuItem } from "@/api";

const name = ref("");
const price = ref("");
const file = ref(null);

function handleFileChange(event) {
  file.value = event.target.files[0];
}

async function saveMenuItem() {
  await addMenuItem("hotel123", {
    name: name.value,
    price: Number(price.value),
    category: "Main",
  }, file.value);
}
</script>

<template>
  <input v-model="name" placeholder="Item name" />
  <input v-model="price" placeholder="Item price" type="number" />
  <input type="file" @change="handleFileChange" />
  <button @click="saveMenuItem">Save Item</button>
</template>