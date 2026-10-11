import {
  Coins,
  EllipsisVertical,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftIcon,
  PanelRightIcon,
  Pencil,
  PenSquare,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getConversations } from "../features/chatApis";
import { useDispatch, useSelector } from "react-redux";
import {
  setConversations,
  SetSelectedConversation,
} from "../redux/conversation.slice";
import { setMessages, setArtifacts } from "../redux/messages.Slice";
import logOut from "../features/LogoutApi";
import { setUserdata } from "../redux/userSlice";
import BilingDrawer from "./BilingDrawer";
import { updateConversation } from "../features/updateConversation";
import { deleteConversation } from "../features/deleteConversation";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);
  const [showBiling, setShowBiling] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null); // which conversation's menu is open
  const [renamingId, setRenamingId] = useState(null); // which conversation is being renamed
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const getConv = async () => {
      const data = await getConversations();
      dispatch(setConversations(data));
    };

    getConv();
  }, [userData?._id]);

  // 👇 ADD THESE
  const handleNewChat = () => {
    dispatch(SetSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
  };

  const handleSelectConversation = (conv) => {
    if (selectedConversation?._id === conv?._id) return;
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    dispatch(SetSelectedConversation(conv));
  };

  // close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRename = (conv) => {
    setMenuOpenId(null);
    setRenamingId(conv._id);
    setRenameValue(conv.title || "");
  };

  const submitRename = async (conv) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title || title === conv.title) return;
    // optimistic update so the UI changes instantly
    const previous = conversations;

    // TODO: rename API here, e.g. await renameConversation(conv._id, title);
    // then update redux:
    dispatch(
      setConversations(
        conversations.map((c) => (c._id === conv._id ? { ...c, title } : c)),
      ),
    );

    const updated = await updateConversation({ id: conv._id, title });

    // your API returns null on failure, so roll back
    if (!updated) {
      dispatch(setConversations(previous));
    }
  };

  const handleDelete = async (conv) => {
    setMenuOpenId(null);

    // TODO:  delete API here, e.g. await deleteConversation(conv._id);
    const result = await deleteConversation(conv._id);
    if (!result) return; //

    dispatch(setConversations(conversations.filter((c) => c._id !== conv._id)));

    if (selectedConversation?._id === conv._id) {
      dispatch(SetSelectedConversation(null));
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
    }
  };

  // for image error
  useEffect(() => {
    setImageError(false);
  }, [userData?.avater]);

  // collapsed functions

  if (collapsed) {
    return (
      <div className=" hidden lg:flex flex-col items-center w-14 h-screen bg-[#0d0f14] border-r border-white/6 py-4 gap-1 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className=" flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 border-none cursor-pointer mb-1"
        >
          <PanelRightIcon />
        </button>

        <button
          onClick={() => handleNewChat()}
          className=" flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <Plus size={17} />
        </button>

        {/* CONVERSATION CHAT */}
        <div className=" flex-1 overflow-y-auto px-2.5 pb2 scrollbar-none [&::-webkit-scrollbar]:hidden pt-5">
          {conversations.map((conv, i) => {
            const isActive = selectedConversation?._id == conv?._id;

            return (
              <div
                key={i}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${isActive ? " bg-indigo-500/10 border-indigo-500/18" : " bg-transparent border-transparent"}`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 w-5 h-5 rounded-lg transition-colors duration-150 ${isActive ? " bg-indigo-500/15 text-indigo-400" : " bg-white/5 text-slate-500"}`}
                >
                  <MessageSquare size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* IMAGE SECTION */}
        <div className=" relative shrink-0">
          {userData?.avater && !imageError ? (
            <img
              className=" w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
              src={userData?.avater}
              alt={userData?.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25">
              <User size={15} className=" text-slate-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className=" lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/6 text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
      >
        <Menu size={14} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className=" lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-67.5 h-dvh lg:h-screen shrink-0 bg-[#0d0f14] border-r border-white/5 transition-transform duration-250 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className=" flex flex-col h-full">
          {/*  HEADER */}
          <div className=" flex items-center gap-2.5 px-4 py-4 border-b border-white/6">
            <div
              onClick={() => {
                setCollapsed(true);
              }}
              className=" hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-stone-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              <PanelLeftIcon />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className=" lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-500 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              <X size={14} />
            </button>
            <span className=" text-[16px] font-semibold text-slate-100 tracking-tight flex-1">
              ByteAi
            </span>
            <span className=" text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide">
              {userData?.plan || "Free"}
            </span>
            <button
              onClick={() => dispatch(SetSelectedConversation(null))}
              className=" flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              <PenSquare size={15} />
            </button>
          </div>

          {/* NEW CHAT */}
          <div className=" px-4 pt-4 pb-1">
            <button
              onClick={() => dispatch(SetSelectedConversation(null))}
              className=" w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity duration-150"
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>

          {/* CONVERSATION  */}
          {conversations.length == 0 ? (
            <div className=" px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
              No Recent conversations
            </div>
          ) : (
            <div className=" px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
              Recent
            </div>
          )}

          <div className=" flex-1 overflow-y-auto px-2.5 pb2 scrollbar-none [&::-webkit-scrollbar]:hidden">
            {conversations.map((conv, i) => {
              const isActive = selectedConversation?._id == conv?._id;
              const isMenuOpen = menuOpenId === conv._id;
              const isRenaming = renamingId === conv._id;

              return (
                <div
                  key={conv._id || i}
                  onClick={() => !isRenaming && handleSelectConversation(conv)}
                  className={`group relative flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                    isActive
                      ? " bg-indigo-500/10 border-indigo-500/18"
                      : " bg-transparent border-transparent hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg transition-colors duration-150 ${
                      isActive
                        ? " bg-indigo-500/15 text-indigo-400"
                        : " bg-white/5 text-slate-500"
                    }`}
                  >
                    <MessageSquare size={13} />
                  </div>

                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => submitRename(conv)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitRename(conv);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="flex-1 min-w-0 text-[13px] font-medium text-slate-100 bg-white/5 border border-indigo-500/30 rounded-md px-2 py-0.5 outline-none"
                    />
                  ) : (
                    <span
                      className={`flex-1 text-[13px] font-medium truncate ${
                        isActive ? " text-slate-100" : " text-slate-300"
                      }`}
                    >
                      {conv?.title || "New Chat"}
                    </span>
                  )}

                  {/* ELLIPSIS BUTTON (visible on hover, or while menu is open) */}
                  {!isRenaming && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : conv._id);
                      }}
                      className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/8 bg-transparent border-none cursor-pointer transition-opacity duration-150 ${
                        isMenuOpen
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <EllipsisVertical size={15} />
                    </button>
                  )}

                  {/* DROPDOWN MENU */}
                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-full mt-1 z-50 w-36 py-1 rounded-xl bg-[#161922] border border-white/8 shadow-xl shadow-black/40"
                    >
                      <button
                        onClick={() => handleRename(conv)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-300 hover:text-slate-100 hover:bg-white/5 bg-transparent border-none cursor-pointer transition-colors duration-150"
                      >
                        <Pencil size={14} />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(conv)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent border-none cursor-pointer transition-colors duration-150"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PROFILE */}
          <div className="mx-2.5 h-px bg-white/6 shrink-0" />
          <div className="shrink-0 px-3.5 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
            {userData ? (
              <div className=" flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors duration-150">
                <div className=" relative shrink-0">
                  {userData?.avater && !imageError ? (
                    <img
                      className=" w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                      src={userData?.avater}
                      alt={userData?.name}
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25">
                      <User size={15} className=" text-slate-400" />
                    </div>
                  )}
                </div>

                <div className=" flex-1 min-w-0">
                  <p className=" text-[13.5px] font-semibold text-slate-100 truncate">
                    {userData?.name || "User"}
                  </p>
                  <p className=" text-[11px] text-slate-600 mt-px">
                    {userData?.plan}
                  </p>
                </div>

                <div className=" flex gap-1">
                  <button
                    onClick={() => setShowBiling(true)}
                    className=" flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                  >
                    <Coins size={16} />
                  </button>
                  <button
                    onClick={() => {
                      (logOut(), dispatch(setUserdata(null)));
                    }}
                    className=" flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/8 hover:text-red-400 transition-all duration-150"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button className=" w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/5 border border-white/8 rounded-xl py-2.75 cursor-pointer hover:bg-white/8 transition-colors duration-150">
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      {/* BILING DRAWER COMPONENT */}
      <BilingDrawer open={showBiling} onClose={() => setShowBiling(false)} />
    </>
  );
}

export default Sidebar;
