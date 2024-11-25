import { createSlice } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string,
  message: string,
  role?: string
}

const initialState: { messages: ChatMessage[]} = { messages: [] };

const chatSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const { id, message, role } = action.payload;

      const existingMessageIndex = state.messages.findIndex((msg) => msg.id === id);

      if (existingMessageIndex !== -1) {
        state.messages = [
          ...state.messages.slice(0, existingMessageIndex),
          { ...state.messages[existingMessageIndex], message },
          ...state.messages.slice(existingMessageIndex + 1),
        ];
      } else {
        state.messages.push({ id, message, role });
      }
    },
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;