import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "@/lib/store";
import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

let debounceTimer: any = null;

interface CartState {
  total: number;
  cartItems: Record<string, number>;
}

const initialState: CartState = {
  total: 0,
  cartItems: {},
};

export const uploadCart = createAsyncThunk<
  void,
  { getToken: () => Promise<string | null> }
>("cart/uploadCart", async ({ getToken }, thunkAPI) => {
  try {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const state = thunkAPI.getState() as RootState;
      const { cartItems } = state.cart;

      const token = await getToken();

      await axios.post(
        "/api/cart",
        { cart: cartItems },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    }, 1000);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getCleanErrorMessage(error, "Failed to upload cart"));
  }
});

export const fetchCart = createAsyncThunk<
  { cart: Record<string, number> },
  { getToken: () => Promise<string | null> }
>("cart/fetchCart", async ({ getToken }, thunkAPI) => {
  try {
    const token = await getToken();
    const { data } = await axios.get("/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getCleanErrorMessage(error, "Failed to fetch cart"));
  }
});


const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ productId: string }>) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]++;
      } else {
        state.cartItems[productId] = 1;
      }
      state.total += 1;
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]--;
        if (state.cartItems[productId] === 0) {
          delete state.cartItems[productId];
        }
      }
      state.total -= 1;
    },
    deleteItemFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      const { productId } = action.payload;
      state.total -= state.cartItems[productId]
        ? state.cartItems[productId]
        : 0;
      delete state.cartItems[productId];
    },
    clearCart: (state) => {
      clearTimeout(debounceTimer);
      state.cartItems = {};
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.cartItems = action.payload.cart;
      state.total = Object.values(action.payload.cart).reduce(
        (acc, item) => acc + item,
        0,
      );
    });
  },
});

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } =
  cartSlice.actions;

export default cartSlice.reducer;
