import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './slice/chat.slice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
})