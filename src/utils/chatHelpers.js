import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";

const LOCAL_CHAT_KEY = "habiwise_demo_chats";
const LOCAL_REPORT_KEY = "habiwise_demo_chat_reports";

const readLocalState = () => {
  if (typeof window === "undefined") {
    return { chats: [], messages: {}, reports: [] };
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_CHAT_KEY) || "{\"chats\":[],\"messages\":{},\"reports\":[]}");
  } catch {
    return { chats: [], messages: {}, reports: [] };
  }
};

const writeLocalState = (state) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(state));
};

const readLocalReports = () => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(LOCAL_REPORT_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeLocalReports = (reports) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_REPORT_KEY, JSON.stringify(reports));
};

const toChatSnapshot = (chatId, data = {}) => ({
  id: chatId,
  chatId,
  ...data,
});

export const getOtherParticipantId = (chat, currentUserId) => {
  const participants = Array.isArray(chat?.participants) ? chat.participants : [];
  return participants.find((participantId) => participantId !== currentUserId) || "";
};

export const getOtherParticipantName = (chat, currentUserId) => {
  if (!chat) return "";
  if (chat.seekerId === currentUserId) return chat.ownerName || "Matched user";
  if (chat.ownerId === currentUserId) return chat.seekerName || "Matched user";
  return chat.ownerName || chat.seekerName || "Matched user";
};

export const ensureChatForConnection = async (connectionId, connectionData = {}) => {
  if (!connectionId) return null;

  if (!isFirebaseConfigured || !db) {
    const state = readLocalState();
    const existing = state.chats.find((chat) => chat.chatId === connectionId);
    if (existing) return existing;

    const chat = {
      chatId: connectionId,
      participants: [connectionData.seekerId || "", connectionData.ownerId || ""].filter(Boolean),
      connectionId,
      createdAt: new Date().toISOString(),
      lastMessage: "🎉 You're now matched! Start your conversation.",
      lastMessageTime: new Date().toISOString(),
      lastMessageBy: "system",
      seekerId: connectionData.seekerId || "",
      seekerName: connectionData.seekerName || "",
      ownerId: connectionData.ownerId || "",
      ownerName: connectionData.ownerName || "",
      compatibility: connectionData.seekerCompatibility || connectionData.compatibility || 0,
    };

    state.chats.push(chat);
    state.messages[connectionId] = [
      {
        id: `${connectionId}_system`,
        senderId: "system",
        senderName: "System",
        text: "🎉 You're now matched! Start your conversation.",
        timestamp: new Date().toISOString(),
        seen: true,
      },
    ];
    writeLocalState(state);
    return chat;
  }

  const chatRef = doc(db, "chats", connectionId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      chatId: connectionId,
      participants: [connectionData.seekerId, connectionData.ownerId].filter(Boolean),
      connectionId,
      createdAt: serverTimestamp(),
      lastMessage: "🎉 You're now matched! Start your conversation.",
      lastMessageTime: serverTimestamp(),
      lastMessageBy: "system",
      seekerId: connectionData.seekerId || "",
      seekerName: connectionData.seekerName || "",
      ownerId: connectionData.ownerId || "",
      ownerName: connectionData.ownerName || "",
      compatibility: connectionData.seekerCompatibility || connectionData.compatibility || 0,
    });

    await addDoc(collection(db, "chats", connectionId, "messages"), {
      senderId: "system",
      senderName: "System",
      text: "🎉 You're now matched! Start your conversation.",
      timestamp: serverTimestamp(),
      seen: true,
    });
  }

  return toChatSnapshot(connectionId, { ...chatDoc.data(), chatId: connectionId });
};

export const listenToChatsForUser = (userId, callback) => {
  if (!userId) return () => {};

  if (!isFirebaseConfigured || !db) {
    const state = readLocalState();
    const chats = state.chats
      .filter((chat) => Array.isArray(chat.participants) && chat.participants.includes(userId))
      .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
    callback(chats);
    return () => {};
  }

  const chatQuery = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(chatQuery, (snapshot) => {
    callback(snapshot.docs.map((chatSnapshot) => ({ id: chatSnapshot.id, ...chatSnapshot.data() })));
  });
};

export const listenToChatMessages = (chatId, callback) => {
  if (!chatId) return () => {};

  if (!isFirebaseConfigured || !db) {
    const state = readLocalState();
    callback((state.messages[chatId] || []).slice().sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)));
    return () => {};
  }

  const messagesQuery = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
  return onSnapshot(messagesQuery, (snapshot) => {
    callback(snapshot.docs.map((messageSnapshot) => ({ id: messageSnapshot.id, ...messageSnapshot.data() })));
  });
};

export const listenToUnreadMessageCount = (userId, callback) => {
  if (!userId) return () => {};

  if (!isFirebaseConfigured || !db) {
    const state = readLocalState();
    const count = state.chats.reduce((total, chat) => {
      if (!Array.isArray(chat.participants) || !chat.participants.includes(userId)) return total;
      const messages = state.messages[chat.chatId] || [];
      return total + messages.filter((message) => message.senderId !== userId && !message.seen).length;
    }, 0);
    callback(count);
    return () => {};
  }

  let visibleChatIds = [];
  let unreadMessages = [];

  const emit = () => {
    const count = unreadMessages.filter(
      (message) => message.senderId !== userId && !message.seen && visibleChatIds.includes(message.chatId)
    ).length;
    callback(count);
  };

  const unsubscribeChats = onSnapshot(
    query(collection(db, "chats"), where("participants", "array-contains", userId)),
    (snapshot) => {
      visibleChatIds = snapshot.docs.map((chatSnapshot) => chatSnapshot.id);
      emit();
    }
  );

  const unsubscribeMessages = onSnapshot(
    query(collectionGroup(db, "messages"), where("seen", "==", false)),
    (snapshot) => {
      unreadMessages = snapshot.docs.map((messageSnapshot) => ({
        id: messageSnapshot.id,
        chatId: messageSnapshot.ref.parent.parent?.id || "",
        ...messageSnapshot.data(),
      }));
      emit();
    }
  );

  return () => {
    unsubscribeChats();
    unsubscribeMessages();
  };
};

export const markMessagesAsSeen = async (chatId, messages = [], currentUserId) => {
  if (!chatId || !currentUserId) return;

  const unreadMessages = messages.filter((message) => message.senderId !== currentUserId && !message.seen);
  if (unreadMessages.length === 0) return;

  if (!isFirebaseConfigured || !db) {
    const state = readLocalState();
    state.messages[chatId] = (state.messages[chatId] || []).map((message) =>
      message.senderId !== currentUserId ? { ...message, seen: true } : message
    );
    const chat = state.chats.find((item) => item.chatId === chatId);
    if (chat) {
      const latest = state.messages[chatId].slice().sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0];
      if (latest) {
        chat.lastMessage = latest.text || chat.lastMessage;
        chat.lastMessageTime = latest.timestamp || chat.lastMessageTime;
      }
    }
    writeLocalState(state);
    return;
  }

  const batch = writeBatch(db);
  unreadMessages.forEach((message) => {
    batch.update(doc(db, "chats", chatId, "messages", message.id), { seen: true });
  });
  await batch.commit();
};

export const sendChatMessage = async (chatId, { senderId, senderName, text }) => {
  if (!chatId || !senderId || !text?.trim()) return null;
  const trimmedText = text.trim();

  if (!isFirebaseConfigured || !db) {
    const state = readLocalState();
    const message = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      senderId,
      senderName: senderName || "You",
      text: trimmedText,
      timestamp: new Date().toISOString(),
      seen: false,
    };

    state.messages[chatId] = [...(state.messages[chatId] || []), message];
    const chat = state.chats.find((item) => item.chatId === chatId);
    if (chat) {
      chat.lastMessage = trimmedText;
      chat.lastMessageTime = message.timestamp;
      chat.lastMessageBy = senderId;
    }
    writeLocalState(state);
    return message;
  }

  const messageRef = await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    senderName: senderName || "You",
    text: trimmedText,
    timestamp: serverTimestamp(),
    seen: false,
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: trimmedText,
    lastMessageTime: serverTimestamp(),
    lastMessageBy: senderId,
  });

  return { id: messageRef.id, senderId, senderName: senderName || "You", text: trimmedText };
};

export const submitChatReport = async ({ chatId, reporterId, targetUserId, reason, description }) => {
  const reportData = {
    chatId,
    reporterId,
    targetUserId,
    reason,
    description,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const reports = readLocalReports();
    reports.push({ id: `${Date.now()}`, ...reportData });
    writeLocalReports(reports);
    return reportData;
  }

  await addDoc(collection(db, "reports"), {
    ...reportData,
    createdAt: serverTimestamp(),
  });

  return reportData;
};
