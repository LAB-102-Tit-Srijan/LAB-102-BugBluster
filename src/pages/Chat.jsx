import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../firebase/config";
import {
  getOtherParticipantId,
  getOtherParticipantName,
  listenToChatMessages,
  markMessagesAsSeen,
  sendChatMessage,
  submitChatReport,
} from "../utils/chatHelpers";

const REPORT_REASONS = ["Inappropriate behavior", "Fake profile", "Spam", "Other"];

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDescription, setReportDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const bottomRef = useRef(null);

  const partnerName = useMemo(() => getOtherParticipantName(chat, currentUser?.uid), [chat, currentUser?.uid]);
  const partnerId = useMemo(() => getOtherParticipantId(chat, currentUser?.uid), [chat, currentUser?.uid]);

  useEffect(() => {
    if (!chatId || !currentUser?.uid) return undefined;

    let unsubscribeChat = () => {};

    if (!isFirebaseConfigured || !db) {
      const state = JSON.parse(localStorage.getItem("habiwise_demo_chats") || "{\"chats\":[],\"messages\":{}}");
      const existing = state.chats.find((item) => item.chatId === chatId);
      setChat(existing || null);
    } else {
      unsubscribeChat = onSnapshot(doc(db, "chats", chatId), (snapshot) => {
        setChat(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      });
    }

    const unsubscribeMessages = listenToChatMessages(chatId, async (chatMessages) => {
      setMessages(chatMessages);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
      await markMessagesAsSeen(chatId, chatMessages, currentUser.uid);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [chatId, currentUser?.uid]);

  useEffect(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentUser?.uid) return;
    await sendChatMessage(chatId, {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.name || "You",
      text: inputText,
    });
    setInputText("");
  };

  const handleReport = async () => {
    await submitChatReport({
      chatId,
      reporterId: currentUser?.uid,
      targetUserId: partnerId,
      reason: reportReason,
      description: reportDescription,
    });
    setStatusMessage("Report submitted. We'll review within 24hrs.");
    setReportOpen(false);
    setReportDescription("");
  };

  if (!chat && isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-slate-100">
        <Navbar />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Chat unavailable</p>
            <h1 className="mt-3 text-2xl font-black text-white">This chat does not exist or you do not have access.</h1>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0D1117] text-slate-100">
      <Navbar />

      <main className="flex flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl shadow-black/30">
          <header className="border-b border-slate-800 bg-slate-950/90 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  ←
                </button>
                <div>
                  <p className="text-lg font-black text-white">{partnerName || "Chat"}</p>
                  <p className="text-xs text-slate-400">
                    {chat?.compatibility || 0}% Compatible • {chat?.seekerName && chat?.ownerName ? (chat.seekerId === currentUser?.uid ? chat.ownerName : chat.seekerName) : "Matched user"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span>Online</span>
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="text-xs font-semibold text-amber-300 hover:text-amber-200"
                >
                  ⚠️ Report this user
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
                  <p className="text-lg font-bold text-white">You're matched.</p>
                  <p className="mt-2 text-sm text-slate-400">Start the conversation from here. Your first message will appear in real time for both sides.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} isMine={message.senderId === currentUser?.uid} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <footer className="border-t border-slate-800 bg-slate-950/90 p-4 sm:p-5">
            <div className="flex gap-3">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-2xl border border-slate-700 bg-[#0D1117] px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-2xl bg-amber-500 px-5 py-3 font-bold text-black transition hover:bg-amber-400"
              >
                Send →
              </button>
            </div>
          </footer>
        </div>
      </main>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0D1117] p-6 shadow-2xl shadow-black/40">
            <h2 className="text-xl font-black text-white">Report this user</h2>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-300">Reason</span>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-500"
                >
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-300">Description</span>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell us what happened..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                />
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleReport}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-3 font-bold text-black"
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/40">
          {statusMessage}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  const isSystem = message.senderId === "system";
  const timestamp = formatTimestamp(message.timestamp);

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center text-sm italic text-slate-400">
          {message.text}
          <div className="mt-1 text-[11px] not-italic text-slate-500">{timestamp}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-lg ${isMine ? "bg-amber-500 text-black" : "bg-slate-900 text-slate-100 border border-slate-800"}`}>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
        <div className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${isMine ? "text-black/70" : "text-slate-500"}`}>
          <span>{timestamp}</span>
          {isMine && <span className={message.seen ? "text-amber-300" : "text-slate-500"}>{message.seen ? "✓✓" : "✓"}</span>}
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
