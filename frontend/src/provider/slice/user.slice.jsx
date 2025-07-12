import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch user data
export const fetchUserData = createAsyncThunk('user/fetchData', async () => {
  const response = await axios.get('/api/user');
  if (typeof response.data !== 'object' || response.data.includes('<html>')) {
    throw new Error('Unexpected response format');
  }

  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: localStorage.getItem("token") || null,
    roles: [], // Updated to handle roles as an array
    name: null,
    email: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    removeUser(state) {
      state.roles = []; // Reset roles array
      state.name = null;
      state.email = null;
    },
    setUser(state, action) {
      if (!action.payload || typeof action.payload !== "object") {
          return;
      }
  
      state.roles = Array.isArray(action.payload.roles) ? action.payload.roles : [];
      state.name = action.payload.name || "Unknown";
      state.email = action.payload.email || null;
  },
  
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = Array.isArray(action.payload.roles) ? action.payload.roles : []; // Ensure roles is an array
        state.name = action.payload.name;
        state.email = action.payload.email;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { removeUser, setUser } = userSlice.actions;
export const UserSlicePath = (state) => state.user;

export default userSlice.reducer;