import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";

/**
 * Create a connection request in Firestore or localStorage
 */
export const createConnection = async (connectionData) => {
  if (!isFirebaseConfigured || !db) {
    // Demo mode: save to localStorage
    try {
      const connections = JSON.parse(localStorage.getItem("habiwise_connections") || "[]");
      const newConnection = {
        id: Date.now().toString(),
        ...connectionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      connections.push(newConnection);
      localStorage.setItem("habiwise_connections", JSON.stringify(connections));
      return newConnection.id;
    } catch (error) {
      console.error("Failed to save connection locally:", error);
      return null;
    }
  }

  try {
    const docRef = await addDoc(collection(db, "connections"), {
      ...connectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to create connection:", error);
    return null;
  }
};

/**
 * Update connection status (liked, unliked, pending)
 */
export const updateConnectionStatus = async (connectionId, status) => {
  if (!isFirebaseConfigured || !db) {
    // Demo mode
    try {
      const connections = JSON.parse(localStorage.getItem("habiwise_connections") || "[]");
      const updated = connections.map((conn) =>
        conn.id === connectionId ? { ...conn, status, updatedAt: new Date().toISOString() } : conn
      );
      localStorage.setItem("habiwise_connections", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update connection locally:", error);
    }
    return;
  }

  try {
    await updateDoc(doc(db, "connections", connectionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to update connection:", error);
  }
};

/**
 * Listen to seeker's connections (real-time)
 */
export const listenToSeekerConnections = (seekerId, callback) => {
  if (!seekerId) return () => {};

  if (!isFirebaseConfigured || !db) {
    // Demo mode: return static listener
    try {
      const connections = JSON.parse(localStorage.getItem("habiwise_connections") || "[]");
      const filtered = connections.filter((conn) => conn.seekerId === seekerId);
      callback(filtered);
    } catch {}
    return () => {};
  }

  const seekerQuery = query(
    collection(db, "connections"),
    where("seekerId", "==", seekerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(seekerQuery, (snapshot) => {
    const connections = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    callback(connections);
  });
};

/**
 * Listen to owner's pending connection requests (real-time)
 */
export const listenToOwnerRequests = (ownerId, callback) => {
  if (!ownerId) return () => {};

  if (!isFirebaseConfigured || !db) {
    // Demo mode
    try {
      const connections = JSON.parse(localStorage.getItem("habiwise_connections") || "[]");
      const filtered = connections.filter((conn) => conn.ownerId === ownerId && conn.status === "pending");
      callback(filtered);
    } catch {}
    return () => {};
  }

  const ownerQuery = query(
    collection(db, "connections"),
    where("ownerId", "==", ownerId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(ownerQuery, (snapshot) => {
    const requests = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    callback(requests);
  });
};

/**
 * Listen to owner's matched connections (real-time)
 */
export const listenToOwnerMatches = (ownerId, callback) => {
  if (!ownerId) return () => {};

  if (!isFirebaseConfigured || !db) {
    // Demo mode
    try {
      const connections = JSON.parse(localStorage.getItem("habiwise_connections") || "[]");
      const filtered = connections.filter((conn) => conn.ownerId === ownerId && conn.status === "liked");
      callback(filtered);
    } catch {}
    return () => {};
  }

  const ownerQuery = query(
    collection(db, "connections"),
    where("ownerId", "==", ownerId),
    where("status", "==", "liked"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(ownerQuery, (snapshot) => {
    const matches = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
    callback(matches);
  });
};

/**
 * Get all connection requests count for owner (for badge)
 */
export const listenToRequestsCount = (ownerId, callback) => {
  if (!ownerId) return () => {};

  if (!isFirebaseConfigured || !db) {
    // Demo mode
    try {
      const connections = JSON.parse(localStorage.getItem("habiwise_connections") || "[]");
      const count = connections.filter((conn) => conn.ownerId === ownerId && conn.status === "pending").length;
      callback(count);
    } catch {}
    return () => {};
  }

  const ownerQuery = query(
    collection(db, "connections"),
    where("ownerId", "==", ownerId),
    where("status", "==", "pending")
  );

  return onSnapshot(ownerQuery, (snapshot) => {
    callback(snapshot.size);
  });
};
