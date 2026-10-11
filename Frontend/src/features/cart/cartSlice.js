import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addCartProduct, getCart, removeCartProduct, updateCartProduct } from "../../services/api";

const requestCart = (request) => async (args, { rejectWithValue }) => {
  try { return (await request(args)).cart || []; }
  catch (error) { return rejectWithValue(error.message); }
};

export const fetchCart = createAsyncThunk("cart/fetch", requestCart(getCart));
export const addToCart = createAsyncThunk("cart/add", requestCart(addCartProduct));
export const updateCartQuantity = createAsyncThunk("cart/update", requestCart(({ productId, quantity }) => updateCartProduct(productId, quantity)));
export const removeFromCart = createAsyncThunk("cart/remove", requestCart(removeCartProduct));

const initialState = { items: [], loading: true, loaded: false, error: "", pendingIds: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: { clearCart: (state) => { state.items = []; state.loading = false; state.loaded = true; state.error = ""; state.pendingIds = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; state.loaded = true; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })
      .addMatcher((action) => [addToCart.pending.type, updateCartQuantity.pending.type, removeFromCart.pending.type].includes(action.type), (state, action) => {
        const id = action.meta.arg?.productId || action.meta.arg;
        if (id && !state.pendingIds.includes(id)) state.pendingIds.push(id);
        state.error = "";
      })
      .addMatcher((action) => [addToCart.fulfilled.type, updateCartQuantity.fulfilled.type, removeFromCart.fulfilled.type].includes(action.type), (state, action) => {
        state.items = action.payload;
        state.pendingIds = state.pendingIds.filter((id) => id !== (action.meta.arg?.productId || action.meta.arg));
      })
      .addMatcher((action) => [addToCart.rejected.type, updateCartQuantity.rejected.type, removeFromCart.rejected.type].includes(action.type), (state, action) => {
        state.error = action.payload || action.error.message;
        state.pendingIds = state.pendingIds.filter((id) => id !== (action.meta.arg?.productId || action.meta.arg));
      });
  },
});

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);
export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
