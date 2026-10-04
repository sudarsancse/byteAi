import { configureStore } from "@reduxjs/toolkit";
import userReduces from "./userSlice";
import conversationReducer from "./conversation.slice";
import messageReducer from "./messages.Slice";

export const store = configureStore({
  reducer: {
    user: userReduces,
    conversation: conversationReducer,
    message: messageReducer,
  },
});
