import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProduct, getProducts } from "../../services/api";

export const fetchProducts = createAsyncThunk("products/fetch", async (filters, { rejectWithValue }) => {
  try { return (await getProducts(filters)).products || []; }
  catch (error) { return rejectWithValue(error.message); }
});

export const fetchProduct = createAsyncThunk("products/fetchOne", async (id, { rejectWithValue }) => {
  try { return (await getProduct(id)).product; }
  catch (error) { return rejectWithValue(error.message); }
});

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], selected: null, loading: false, error: "" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.error = ""; state.selected = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.selected = action.payload; state.loading = false; })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error.message; });
  },
});

export default productsSlice.reducer;
