import { configureStore } from '@reduxjs/toolkit'
import chatReducer from '@/lib/redux/slice/chat.slice'

export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      chat: chatReducer
    },
    preloadedState: initialState
  })
}
