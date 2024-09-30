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
      const {id, message, role} = action.payload;
      state.messages.push({
        id,
        message,
        role
      })
    },
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;