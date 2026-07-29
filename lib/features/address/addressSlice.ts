import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Address } from "@/types";

interface AddressState {
  list: Address[];
}

const initialState: AddressState = {
  list: [],
};

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

export const fetchAddress = createAsyncThunk<
  Address[],
  { getToken: () => Promise<string | null> }
>("address/fetchAddress", async ({ getToken }, thunkAPI) => {
  try {
    const token = await getToken();
    const { data } = await axios.get("/api/address", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data ? data.addresses : [];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getCleanErrorMessage(error, "Failed to fetch address"));
  }
});

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<Address>) => {
      state.list.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAddress.fulfilled, (state, action) => {
      state.list = action.payload;
    });
  },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
