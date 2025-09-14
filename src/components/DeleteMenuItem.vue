<script setup>
import { deleteMenuItem } from "@/api";

async function removeItem(itemId) {
  if (confirm("Are you sure you want to delete this item?")) {
    await deleteMenuItem("hotel123", itemId);
    alert("Item deleted successfully");
  }
}
</script>

<template>
  <button @click="removeItem('burger-123')">Delete Item</button>
</template>