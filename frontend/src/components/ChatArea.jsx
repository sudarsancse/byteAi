import { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import { setArtifacts, setMessages } from "../redux/messages.Slice";
import getMessages from "../features/getMessages";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    const getMessage = async () => {
      if (selectedConversation) {
        if (selectedConversation.title == "New Chat") return;
        const data = await getMessages(selectedConversation?._id);
        if (cancelled) return;
        dispatch(setMessages(data));

        const leatestArtifactsMsg = [...data]
          .reverse()
          .find((msg) => msg.artifacts && msg.artifacts.length > 0);
        dispatch(setArtifacts(leatestArtifactsMsg?.artifacts || []));
      }
    };

    getMessage();
  }, [selectedConversation?._id]);
  return (
    <div className=" flex-1 flex min-w-0 flex-col">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;
