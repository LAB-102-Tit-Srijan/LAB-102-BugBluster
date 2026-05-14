import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collectionGroup, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../firebase/config";
import { listenToChatsForUser, listenToUnreadMessageCount, getOtherParticipantName } from "../utils/chatHelpers";

const formatTimeAgo = (value) => {
  if (!value) return "Recently";
  const timestamp = typeof value === "string" ? new Date(value).getTime() : value?.seconds ? value.seconds * 1000 : Date.now();
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} d ago`;
};

export default function ChatList({ compact = false }) {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState({});

  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    const unsubscribeChats = listenToChatsForUser(currentUser.uid, setChats);
    const unsubscribeUnread = listenToUnreadMessageCount(currentUser.uid, setUnreadCount);
    let unsubscribeUnreadMap = () => {};

    if (isFirebaseConfigured && db) {
      unsubscribeUnreadMap = onSnapshot(
        query(collectionGroup(db, "messages"), where("seen", "==", false)),
        (snapshot) => {
          const next = {};
          snapshot.docs.forEach((messageSnapshot) => {
            const chatId = messageSnapshot.ref.parent.parent?.id;
            const data = messageSnapshot.data();
            if (!chatId || data.senderId === currentUser.uid) return;
            next[chatId] = (next[chatId] || 0) + 1;
          });
          setUnreadByChat(next);
        }
      );
    } else {
      setUnreadByChat({});
    }

    return () => {
      unsubscribeChats();
      unsubscribeUnread();
      unsubscribeUnreadMap();
    };
  }, [currentUser?.uid]);

  const rows = useMemo(() => {
    return chats.map((chat, index) => {
      const otherName = getOtherParticipantName(chat, currentUser?.uid);
      const preview = chat.lastMessage || "Start the conversation";
      const localUnread = 0;
      return {
        ...chat,
        otherName,
        preview,
        localUnread: unreadByChat[chat.chatId] || 0,
        accent: index % 3 === 0 ? "from-amber-400 to-amber-500" : index % 3 === 1 ? "from-slate-600 to-slate-500" : "from-emerald-500 to-emerald-600",
      };
    });
  }, [chats, currentUser?.uid, unreadByChat]);

  return (
    <section id="messages" className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Messages</p>
          <h2 className="mt-1 text-xl font-black text-white">Messages ({unreadCount})</h2>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
          Real-time
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
          No chats yet. A chat appears after a mutual match is confirmed.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((chat) => (
            <Link
              key={chat.chatId}
              to={`/chat/${chat.chatId}`}
              className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-amber-500/40 hover:bg-slate-900"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${chat.accent} text-sm font-black text-white`}>
                {String(chat.otherName || "?")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="truncate text-sm font-semibold text-white">{chat.otherName}</p>
                    <p className="text-xs text-amber-300">{chat.compatibility || 0}% Match</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatTimeAgo(chat.lastMessageTime)}</p>
                </div>
                <p className="mt-1 truncate text-sm text-slate-400">{previewText(chat.preview)}</p>
                {chat.localUnread > 0 && (
                  <div className="mt-2 inline-flex rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-black">
                    unread {chat.localUnread}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function previewText(text) {
  return String(text || "").replace(/^🎉\s*/, "").slice(0, 70);
}
