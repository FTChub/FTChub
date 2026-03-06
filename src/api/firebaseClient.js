import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage, googleProvider } from '../lib/firebase';

// Authentication functions
export const authService = {
  // Sign in with Email and Password
  signInWithEmail: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  },

  // Sign up with Email and Password
  signUpWithEmail: async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Update user profile
  updateProfile: async (updates) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    try {
      await updateProfile(auth.currentUser, updates);
      return auth.currentUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// User management
export const userService = {
  // Get user by ID
  getUser: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Create or update user
  saveUser: async (userData) => {
    try {
      const userRef = doc(db, 'users', userData.uid);
      const docData = { ...userData, updatedAt: new Date() };
      await updateDoc(userRef, docData).catch(() => {
        // If document doesn't exist, create it
        return setDoc(userRef, { ...docData, createdAt: new Date() }, { merge: true });
      });
      return userData;
    } catch (error) {
      console.error('Save user error:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      return usersSnapshot.docs.map(doc => ({ id: doc.id, uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role, updatedAt: new Date() });
      return true;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { ...updates, updatedAt: new Date() });
      return true;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
};

// Team entries management
export const entryService = {
  // Create entry
  createEntry: async (entryData) => {
    try {
      const docRef = await addDoc(collection(db, 'entries'), {
        ...entryData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...entryData };
    } catch (error) {
      console.error('Create entry error:', error);
      throw error;
    }
  },

  // Get all entries
  getAllEntries: async (limitCount = 200) => {
    try {
      const entriesSnapshot = await getDocs(collection(db, 'entries'));
      let entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending
      entries.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      return entries.slice(0, limitCount);
    } catch (error) {
      console.error('Get all entries error:', error);
      throw error;
    }
  },

  // Get entry by ID
  getEntry: async (entryId) => {
    try {
      const entryDoc = await getDoc(doc(db, 'entries', entryId));
      if (entryDoc.exists()) {
        return { id: entryDoc.id, ...entryDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Get entry error:', error);
      throw error;
    }
  },

  // Update entry
  updateEntry: async (entryId, updates) => {
    try {
      const entryRef = doc(db, 'entries', entryId);
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Update entry error:', error);
      throw error;
    }
  },

  // Delete entry
  deleteEntry: async (entryId) => {
    try {
      const entryRef = doc(db, 'entries', entryId);
      const entrySnap = await getDoc(entryRef);
      if (entrySnap.exists()) {
        const data = entrySnap.data();
        const urlsToDelete = [...(data.image_urls || []), ...(data.file_urls || [])];
        for (const url of urlsToDelete) {
          try {
            await deleteObject(ref(storage, url));
          } catch (err) {
            console.error('Failed to delete storage object', err);
          }
        }
      }
      await deleteDoc(entryRef);
      return true;
    } catch (error) {
      console.error('Delete entry error:', error);
      throw error;
    }
  },

  // Get entries by user
  getEntriesByUser: async (userEmail) => {
    try {
      const entriesQuery = query(
        collection(db, 'entries'),
        where('created_by', '==', userEmail)
      );
      const querySnapshot = await getDocs(entriesQuery);
      let entries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending
      entries.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      return entries;
    } catch (error) {
      console.error('Get entries by user error:', error);
      throw error;
    }
  },

  // Filter entries
  filterEntries: async (filters) => {
    try {
      let constraints = [];

      if (filters.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.created_by) {
        constraints.push(where('created_by', '==', filters.created_by));
      }

      let entriesQuery = collection(db, 'entries');
      if (constraints.length > 0) {
        entriesQuery = query(entriesQuery, ...constraints);
      }

      const querySnapshot = await getDocs(entriesQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Filter entries error:', error);
      throw error;
    }
  }
};

// Bookmarks management
export const bookmarkService = {
  // Create bookmark
  createBookmark: async (bookmarkData) => {
    try {
      const docRef = await addDoc(collection(db, 'bookmarks'), {
        ...bookmarkData,
        createdAt: new Date()
      });
      return { id: docRef.id, ...bookmarkData };
    } catch (error) {
      console.error('Create bookmark error:', error);
      throw error;
    }
  },

  // Get bookmarks by user
  getBookmarksByUser: async (userEmail) => {
    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('user_email', '==', userEmail)
      );
      const querySnapshot = await getDocs(bookmarksQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get bookmarks by user error:', error);
      throw error;
    }
  },

  // Delete bookmark
  deleteBookmark: async (bookmarkId) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      return true;
    } catch (error) {
      console.error('Delete bookmark error:', error);
      throw error;
    }
  },

  // Check if entry is bookmarked by user
  isBookmarked: async (entryId, userEmail) => {
    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('entry_id', '==', entryId),
        where('user_email', '==', userEmail)
      );
      const querySnapshot = await getDocs(bookmarksQuery);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Check bookmark error:', error);
      throw error;
    }
  }
};

// File upload service
export const fileService = {
  // Upload file
  uploadFile: async (file) => {
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { file_url: downloadURL, file_path: snapshot.ref.fullPath };
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (filePath) => {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
};

// Real-time listeners
export const realtimeService = {
  // Listen to entries changes
  onEntriesChange: (callback) => {
    const unsubscribe = onSnapshot(collection(db, 'entries'), (querySnapshot) => {
      let entries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending
      entries.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      callback(entries);
    });
    return unsubscribe;
  },

  // Listen to user changes
  onUserChange: (userId, callback) => {
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  },

  // Listen to messages for inbox (recipient)
  onMessagesForUser: (userId, callback) => {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('recipient_id', '==', userId)
    );
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      let msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort descending
      msgs.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      callback(msgs);
    });
    return unsubscribe;
  },

  // Listen to conversation between two users
  onConversation: (userId1, userId2, callback) => {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('sender_id', 'in', [userId1, userId2]),
      where('recipient_id', 'in', [userId1, userId2])
    );
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      let msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort ascending
      msgs.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA - dateB;
      });
      callback(msgs);
    });
    return unsubscribe;
  },

  // Listen for comments on an entry
  onCommentsForEntry: (entryId, callback) => {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('entry_id', '==', entryId)
    );
    const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
      let comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort by createdAt asc
      comments.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA - dateB;
      });
      callback(comments);
    });
    return unsubscribe;
  }
};

// Comments management
export const commentService = {
  // Create comment
  createComment: async (commentData) => {
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        ...commentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...commentData };
    } catch (error) {
      console.error('Create comment error:', error);
      throw error;
    }
  },

  // Get comments for entry
  getCommentsForEntry: async (entryId) => {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('entry_id', '==', entryId)
      );
      const querySnapshot = await getDocs(commentsQuery);
      let comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt client-side to avoid index requirement
      comments.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA - dateB;
      });
      return comments;
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      return true;
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  }
};

// Messages management
export const messageService = {
  // Send message
  sendMessage: async (messageData) => {
    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        ...messageData,
        createdAt: new Date(),
        read: false
      });
      return { id: docRef.id, ...messageData };
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get messages for user
  getMessagesForUser: async (userId) => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipient_id', '==', userId)
      );
      const querySnapshot = await getDocs(messagesQuery);
      let messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort client-side descending by createdAt to avoid needing an index
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      return messages;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  // Get conversation between two users
  getConversation: async (userId1, userId2) => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('sender_id', 'in', [userId1, userId2]),
        where('recipient_id', 'in', [userId1, userId2])
      );
      const querySnapshot = await getDocs(messagesQuery);
      let messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort ascending by createdAt client-side
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA - dateB;
      });
      return messages;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { read: true });
      return true;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  // Delete message - disabled (messages are immutable once sent)
  deleteMessage: async (messageId) => {
    console.warn('deleteMessage called but deletion is disabled');
    throw new Error('Message deletion is not allowed');
  }
};