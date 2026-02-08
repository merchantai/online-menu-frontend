import { defineStore } from "pinia";
import * as api from "@/api";

export const useDataStore = defineStore("data", {
  state: () => ({
    hotelData: null,
    loggedInUser: null,
    isAuth: false,
    menu: [],
  }),
  actions: {
  },
});