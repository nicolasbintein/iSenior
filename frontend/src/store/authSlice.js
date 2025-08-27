import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      username: localStorage.getItem('username') || '',
      role: localStorage.getItem('role') || null,
    },
  },
  reducers: {
    login: (state, action) => {
      state.user.username = action.payload.username;
      state.user.role = action.payload.role;
      localStorage.setItem('username', action.payload.username);
      localStorage.setItem('role', action.payload.role);
    },
    logout: (state) => {
      state.user.username = '';
      state.user.role = null;
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;