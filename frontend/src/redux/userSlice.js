import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null, // * this one like (useState name ,setName)
    loading: true,
  },
  reducers: {
    // * update the state value
    setUserdata: (state, action) => {
      //* state (current state value) action (updated value )
      state.userData = action.payload;
      state.loading = false; // * When data is save in user data loding make false
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUserdata, setLoading } = userSlice.actions;
export default userSlice.reducer;
