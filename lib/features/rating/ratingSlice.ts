import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RatingWithUser } from "@/types";

interface RatingState {
  ratings: RatingWithUser[];
}

const initialState: RatingState = {
  ratings: [],
};

import { getCleanErrorMessage } from "@/lib/getCleanErrorMessage";

export const fetchUserRatings = createAsyncThunk<
  RatingWithUser[],
  { getToken: () => Promise<string | null> }
>("rating/fetchUserRatings", async ({ getToken }, thunkAPI) => {
  try {
    const token = await getToken();
    const { data } = await axios.get("/api/rating", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error: any) {
    console.error(error);
    return thunkAPI.rejectWithValue(getCleanErrorMessage(error, "Failed to fetch user ratings"));
  }
});

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    addRating: (state, action: PayloadAction<RatingWithUser>) => {
      if (action.payload) {
        state.ratings.push(action.payload);
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchUserRatings.fulfilled, (state, action) => {
      state.ratings = action.payload;
    });
  },
});

export const { addRating } = ratingSlice.actions;

export default ratingSlice.reducer;
