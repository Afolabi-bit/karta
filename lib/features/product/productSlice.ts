import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { ProductWithDetails } from "@/types";

interface ProductState {
  list: ProductWithDetails[];
  loading: boolean;
}

const initialState: ProductState = {
  list: [],
  loading: true,
};

export const fetchProducts = createAsyncThunk<
  ProductWithDetails[],
  { storeId?: string }
>("product/fetchProducts", async ({ storeId }, thunkAPI) => {
  try {
    const { data } = await axios.get(
      "/api/products" + (storeId ? `?storeId=${storeId}` : ""),
    );
    return data.products;
  } catch (error: any) {
    console.log(error);
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<ProductWithDetails[]>) => {
      state.list = action.payload;
      state.loading = false;
    },
    clearProduct: (state) => {
      state.list = [];
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setProduct, clearProduct } = productSlice.actions;

export default productSlice.reducer;
