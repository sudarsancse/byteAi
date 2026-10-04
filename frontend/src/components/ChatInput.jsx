import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import sendMessageApi from "../features/sendMessageApi";
import {
  addMessage,
  setArtifacts,
  setIsLoading,
  setMessages,
} from "../redux/messages.Slice";
import { createConversation } from "../features/chatApis";
import {
  addConversation,
  setConvTitle,
  SetSelectedConversation,
} from "../redux/conversation.slice";
import { updateConversation } from "../features/updateConversation";
import { useRef } from "react";

function ChatInput() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message);
  const [selectedFile, setSelectedFile] = useState(null);
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const dispatch = useDispatch();
  const fileRaf = useRef(null);
  const recognitionRef = useRef(null);

  // FOR VOICE PROCESS
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        transcript += event.results[index][0].transcript;
      }

      setValue(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  // MIC BTN FUN
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Your browser not support Speech recohnigition");
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handelSendMessage = async () => {
    dispatch(setIsLoading(true));
    let conversation = selectedConversation;
    if (!conversation) {
      const conv = await createConversation();
      dispatch(setMessages([])); // 👈 add
      dispatch(setArtifacts([]));
      dispatch(SetSelectedConversation(conv));
      dispatch(addConversation(conv));
      conversation = conv;
    }

    if (conversation.title == "New Chat") {
      await updateConversation({
        id: conversation?._id,
        title: value.trim(),
      });

      dispatch(
        setConvTitle({
          conversationId: conversation._id,
          title: value.trim(),
        }),
      );
    }

    const formData = new FormData();
    formData.append("prompt", value.trim());
    formData.append("conversationId", conversation._id);
    formData.append("agent", selectedAgent.toLowerCase());
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    dispatch(addMessage({ role: "user", content: value.trim() }));
    setValue("");
    const data = await sendMessageApi(formData);
    dispatch(setIsLoading(false));
    setSelectedFile(null);
    dispatch(setArtifacts(data?.artifacts || []));
    dispatch(
      addMessage({
        role: "assistant",
        content: data?.answer,
        images: data?.images,
      }),
    );
    // console.log(data);
  };

  // AGENTS
  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "imageGen", icon: ImageIcon, label: "imageGen" },
    { id: "search", icon: Globe, label: "Search" },
  ];

  return (
    <div className=" w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className=" flex flex-col gap-2 bg-white/3 border-white/7 rounded-2xl px-4 pt-3.5 pb-3">
        {/* All AGEST */}
        <div className=" flex w-[80%] gap-2 pr-2 flex-wrap">
          {agents.map((agent, i) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;
            return (
              <div
                key={i}
                onClick={() => setSelectedAgent(agent.label)}
                className={` shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all  ${isActive ? " bg-linear-to-r from-indigo-500 to-violet-600 text-white broder-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)] " : " bg-white/3 text-slate-400 border-white/6 hover:bg-white/[0.07]"}`}
              >
                <Icon
                  size={12}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </div>
            );
          })}
        </div>

        {/* SHOWING THE FILE HERE */}
        {selectedFile && (
          <div className=" my-3">
            <div className=" inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2">
              {selectedFile.type === "application/pdf" ? (
                <FileText size={16} className=" text-red-400" />
              ) : (
                selectedFile.type.startsWith("image/") && (
                  <img
                    className=" h-10 w-10 rounded-xl object-cover mt-3"
                    src={URL.createObjectURL(selectedFile)}
                  />
                )
              )}

              <div className="">
                <p className=" text-xs text-white">{selectedFile?.name}</p>
                <p className=" text-[10px] text-slate-500">
                  {Math.ceil(selectedFile?.size)} kb
                </p>
              </div>
              <button className=" ml-2">
                <X
                  className=" text-slate-500 hover:text-red-400"
                  onClick={() => {
                    setSelectedFile(null);
                    fileRaf.current.value = "";
                  }}
                  size={14}
                />
              </button>
            </div>
          </div>
        )}
        <textarea
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder=" Ask Anything..."
          className=" w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />
        <div className=" flex items-center justify-between">
          <div className=" flex items-center gap-1">
            <input
              className=""
              type="file"
              accept=".pdf, image/*"
              hidden
              ref={fileRaf}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <button
              onClick={() => fileRaf.current?.click()}
              className=" flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer"
            >
              <Paperclip size={16} />
            </button>
            <button
              onClick={toggleMic}
              className={`flex items-center justify-center w-8 h-8 rounded-lg  border border-transparent transition-all duration-150  cursor-pointer ${listening ? " bg-red-500 text-white" : " text-slate-600 hover:bg-white/6"}`}
            >
              {listening ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
          </div>
          <button
            onClick={handelSendMessage}
            disabled={!value && isLoading}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 ${
              value?.trim()
                ? " bg-linear-to-r from-indigo-500 to-violet-700 hover:opacity-90 text-white"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
