// lib/friends.js — localStorage persistence for friend chats
// Since ghostId is per-tab, we store chatIds in localStorage so chats survive refreshes

const STORAGE_KEY = 'drift_friends';

/**
 * Get all saved friend entries from localStorage
 * @returns {{ chatId: string, partnerGhostName: string, partnerAvatarId: number, addedAt: number }[]}
 */
export function getSavedFriends() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Save a new friend chat entry to localStorage
 */
export function saveFriend({ chatId, partnerGhostName, partnerAvatarId }) {
  try {
    const existing = getSavedFriends();
    // Avoid duplicates
    if (existing.some(f => f.chatId === chatId)) return;
    existing.unshift({ chatId, partnerGhostName, partnerAvatarId, addedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[Friends] Error saving friend:', err);
  }
}

/**
 * Remove a friend chat from localStorage (e.g. expired)
 */
export function removeFriend(chatId) {
  try {
    const existing = getSavedFriends().filter(f => f.chatId !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[Friends] Error removing friend:', err);
  }
}

/**
 * Update partner name/avatar for an existing entry (in case it changes)
 */
export function updateFriend(chatId, updates) {
  try {
    const existing = getSavedFriends().map(f =>
      f.chatId === chatId ? { ...f, ...updates } : f
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[Friends] Error updating friend:', err);
  }
}
