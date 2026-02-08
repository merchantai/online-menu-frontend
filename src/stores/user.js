import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { 
  login as apiLogin, 
  logout as apiLogout, 
  watchAuthState 
} from "../api";

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const loading = ref(true);

  // Initialize auth listener
  watchAuthState((currentUser) => {
    user.value = currentUser;
    loading.value = false;
  });

  const login = async () => {
    try {
      await apiLogin();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    user,
    loading,
    login,
    logout
  };
});
