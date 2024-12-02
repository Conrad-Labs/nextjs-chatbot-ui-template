import { createSlice } from '@reduxjs/toolkit';
import { FileData } from '@/lib/types';

export enum Roles {
  user = 'user',
  assistant = 'assistant'
}

export interface ChatMessage {
  id: string,
  message: string,
  role?: Roles
  files?: FileData[]
}

const initialState: { messages: ChatMessage[], threadId: string } = { messages: [], threadId: '' };

const chatSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { id, message, role, files } = action.payload;
      const existingMessageIndex = state.messages.findIndex((msg) => msg.id === id);
      if (existingMessageIndex !== -1) {
        // update message for streaming
        state.messages = [
          ...state.messages.slice(0, existingMessageIndex),
          { ...state.messages[existingMessageIndex], message },
          ...state.messages.slice(existingMessageIndex + 1),
        ];
      } else {
        // add a new message
        state.messages.push({
          id,
          message,
          role,
          files
        })
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