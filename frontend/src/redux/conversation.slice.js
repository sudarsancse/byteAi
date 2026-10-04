import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation: null,
  },

  reducers: {
    //^ This help to store all the conversation that are come from DB
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    //^ This help to store all the conversation that are come from DB and add New conversation aswell
    addConversation: (state, action) => {
      //! using ( unshif() ) Add new conversation to the start of the list (most recent first)
      state.conversations.unshift(action.payload);
    },
    SetSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },

    //^ Update the conversation Title
    setConvTitle: (state, action) => {
      const { title, conversationId } = action.payload;
      state.conversations = state.conversations.map((conv) =>
        conv._id == conversationId ? { ...conv, title } : conv,
      );

      if (state.selectedConversation?._id == conversationId) {
        state.selectedConversation = { ...state.selectedConversation, title };
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  SetSelectedConversation,
  setConvTitle,
} = conversationSlice.actions;
export default conversationSlice.reducer;
