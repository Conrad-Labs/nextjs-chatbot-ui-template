import { createSlice } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string,
  message: string,
  role?: string
}

const initialState: { messages: ChatMessage[], threadId: string } = { messages: [], threadId: '' };

const chatSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { id, message, role } = action.payload;
      const messageExists = state.messages.some((msg) => msg.id === id);
      if (!messageExists) {
        state.messages.push({
          id,
          message,
          role,
        });
      }
    },
    setThreadId: (state, action) => {
      state.threadId = action.payload
    },
    removeMessages: (state) => {
      state.messages = []
    }
  },
});

export const { addMessage, setThreadId, removeMessages } = chatSlice.actions;
export default chatSlice.reducer;