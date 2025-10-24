// store/authStore.js
import { create } from "zustand";
import axios from "axios";

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userProducts: [],
  isAuthenticated: false,
  loading: false,
  productsLoading: false,

  // Fetch user profile
  fetchUserProfile: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }

    set({ loading: true });

    try {
      const response = await axios.get(
        "https://0699e0a2094e.ngrok-free.app/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      set({
        user: response.data,
        isAuthenticated: true,
        loading: false,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        set({ user: null, isAuthenticated: false });
      }

      set({ loading: false });
      return null;
    }
  },

  // Fetch user products
  fetchUserProducts: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      set({ userProducts: [] });
      return;
    }

    set({ productsLoading: true });

    try {
      const response = await axios.get(
        "https://0699e0a2094e.ngrok-free.app/api/products/user/my-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      set({ userProducts: response.data || [], productsLoading: false });
    } catch (error) {
      console.error("Error fetching user products:", error);
      set({ userProducts: [], productsLoading: false });
    }
  },

  // Initialize authentication (fetch all data at once)
  initializeAuth: async () => {
    const userProfile = await get().fetchUserProfile();
    if (userProfile) {
      await get().fetchUserProducts();
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    set({ user: null, userProducts: [], isAuthenticated: false });
    window.location.replace("/");
  },

  // Update user data
  updateUser: (userData) => {
    set({ user: userData });
  },

  // Add new product
  addProduct: (product) => {
    set((state) => ({ userProducts: [...state.userProducts, product] }));
  },

  // Remove product
  removeProduct: (productId) => {
    set((state) => ({
      userProducts: state.userProducts.filter((p) => p._id !== productId),
    }));
  },
}));

export default useAuthStore;