import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getWishlist, removeWishlistProduct, toggleWishlist as toggleWishlistApi } from "../../services/api";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try { return (await getWishlist()).wishlist || []; }
  catch (error) { return rejectWithValue(error.message); }
});

export const toggleWishlist = createAsyncThunk("wishlist/toggle", async (product, { rejectWithValue }) => {
  try { return { product, ...(await toggleWishlistApi(product._id)) }; }
  catch (error) { return rejectWithValue(error.message); }
});

export const removeWishlistItem = createAsyncThunk("wishlist/remove", async (productId, { rejectWithValue }) => {
  try { await removeWishlistProduct(productId); return productId; }
  catch (error) { return rejectWithValue(error.message); }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], loading: true, loaded: false, error: "", pendingIds: [] },
  reducers: { clearWishlist: () => ({ items: [], loading: false, loaded: false, error: "", pendingIds: [] }) },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; state.loaded = true; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })
      .addCase(toggleWishlist.pending, (state, action) => { if (!state.pendingIds.includes(action.meta.arg._id)) state.pendingIds.push(action.meta.arg._id); state.error = ""; })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { product, saved } = action.payload;
        if (saved && !state.items.some((item) => item._id === product._id)) state.items.push(product);
        if (!saved) state.items = state.items.filter((item) => item._id !== product._id);
        state.pendingIds = state.pendingIds.filter((id) => id !== product._id);
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg._id);
      })
      .addCase(removeWishlistItem.pending, (state, action) => { if (!state.pendingIds.includes(action.meta.arg)) state.pendingIds.push(action.meta.arg); state.error = ""; })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload);
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg);
      });
  },
});

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
