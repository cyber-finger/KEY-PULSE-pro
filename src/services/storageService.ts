import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { TypingSession, LeaderboardEntry, UserProfile, CustomText } from '../types';
import { evaluateBadges, calculateTotalWordsTyped } from '../data/achievements';

const LOCAL_STORAGE_SESSIONS = 'keypulse_sessions_v1';
const LOCAL_STORAGE_CUSTOM_TEXTS = 'keypulse_custom_texts_v1';
const LOCAL_STORAGE_PROFILE = 'keypulse_profile_v1';

export const storageService = {
  // Local storage retrieval
  getLocalSessions(): TypingSession[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocalSession(session: TypingSession) {
    try {
      const existing = this.getLocalSessions();
      const updated = [session, ...existing].slice(0, 500); // store last 500
      localStorage.setItem(LOCAL_STORAGE_SESSIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save session locally', e);
    }
  },

  getLocalCustomTexts(): CustomText[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CUSTOM_TEXTS);
      if (data) return JSON.parse(data);
      // Default starter custom texts
      const starters: CustomText[] = [
        {
          id: 'starter-1',
          userId: 'local',
          title: 'Mechanical Keyboard Lore',
          content: 'Mechanical keyboards use physical switches underneath each key. Keystroke feel, actuation travel distance, and audible feedback define the typing experience.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'starter-2',
          userId: 'local',
          title: 'The Flow State in Typing',
          content: 'When fingers move without conscious instruction, typing transforms from mechanical input into a direct extension of thought. Relax the wrists and let rhythm guide speed.',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_TEXTS, JSON.stringify(starters));
      return starters;
    } catch {
      return [];
    }
  },

  saveLocalCustomText(text: CustomText) {
    try {
      const existing = this.getLocalCustomTexts();
      const index = existing.findIndex(t => t.id === text.id);
      let updated: CustomText[];
      if (index >= 0) {
        updated = [...existing];
        updated[index] = text;
      } else {
        updated = [text, ...existing];
      }
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_TEXTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save custom text locally', e);
    }
  },

  deleteLocalCustomText(id: string) {
    try {
      const existing = this.getLocalCustomTexts();
      const filtered = existing.filter(t => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_TEXTS, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to delete custom text locally', e);
    }
  },

  getLocalProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLocalProfile(profile: UserProfile) {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile locally', e);
    }
  },

  // Cloud Sync Operations
  async syncSessionToCloud(session: TypingSession): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const path = `users/${user.uid}/sessions/${session.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'sessions', session.id), {
        id: session.id,
        userId: user.uid,
        wpm: session.wpm,
        cpm: session.cpm,
        rawWpm: session.rawWpm || session.wpm,
        accuracy: session.accuracy,
        duration: session.duration,
        characterCount: session.characterCount,
        errorCount: session.errorCount,
        mode: session.mode,
        category: session.category || 'common-words',
        timestamp: session.timestamp
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }

    // Also update UserProfile stats in Firestore
    const userPath = `users/${user.uid}`;
    try {
      const sessions = this.getLocalSessions();
      const currentProfile = this.getLocalProfile();
      const bestWpm = Math.max(session.wpm, ...sessions.map(s => s.wpm), 0);
      const bestCpm = Math.max(session.cpm, ...sessions.map(s => s.cpm), 0);
      const avgAccuracy = sessions.length > 0
        ? Math.round(sessions.reduce((acc, cur) => acc + cur.accuracy, 0) / sessions.length * 10) / 10
        : session.accuracy;

      const totalWords = calculateTotalWordsTyped(sessions);
      const badgeEval = evaluateBadges(sessions, currentProfile?.unlockedBadgeIds || []);

      const profile: UserProfile = {
        uid: user.uid,
        displayName: currentProfile?.displayName || user.displayName || 'Typist',
        photoURL: user.photoURL || '',
        bestWpm,
        bestCpm,
        testsCompleted: sessions.length,
        averageAccuracy: avgAccuracy,
        totalWordsTyped: totalWords,
        achievementPoints: badgeEval.totalPoints,
        unlockedBadgeIds: badgeEval.unlockedBadgeIds,
        pinnedBadgeId: currentProfile?.pinnedBadgeId || (badgeEval.unlockedBadgeIds[0] || undefined),
        favoriteQuote: currentProfile?.favoriteQuote || '',
        lastUsernameChangeDate: currentProfile?.lastUsernameChangeDate,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      this.saveLocalProfile(profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  },

  async publishToLeaderboard(session: TypingSession, displayName?: string, photoURL?: string): Promise<void> {
    const user = auth.currentUser;
    const profile = this.getLocalProfile();
    const effectiveName = displayName?.trim() || profile?.displayName || user?.displayName || 'Anonymous Typist';

    if (!user) {
      // For guests or unauthenticated users, keep a local high score profile
      if (profile) {
        this.saveLocalProfile({
          ...profile,
          displayName: effectiveName,
          bestWpm: Math.max(profile.bestWpm, session.wpm)
        });
      }
      return;
    }

    const entryId = `${user.uid}_${session.mode}`.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const path = `leaderboard/${entryId}`;

    try {
      const entry: LeaderboardEntry = {
        id: entryId,
        userId: user.uid,
        displayName: effectiveName,
        photoURL: photoURL || user.photoURL || '',
        wpm: session.wpm,
        cpm: session.cpm,
        accuracy: session.accuracy,
        mode: session.mode,
        category: session.category,
        pinnedBadgeId: profile?.pinnedBadgeId,
        achievementPoints: profile?.achievementPoints,
        favoriteQuote: profile?.favoriteQuote || '',
        timestamp: session.timestamp
      };

      await setDoc(doc(db, 'leaderboard', entryId), entry, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async setPinnedBadge(badgeId: string): Promise<void> {
    const profile = this.getLocalProfile();
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      pinnedBadgeId: badgeId,
      updatedAt: new Date().toISOString()
    };
    this.saveLocalProfile(updated);

    const user = auth.currentUser;
    if (user) {
      const userPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), { pinnedBadgeId: badgeId, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, userPath);
      }
    }
  },

  /**
   * Fetches genuine real user records from Firestore (strictly removes fake seed bots).
   */
  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const path = 'leaderboard';
    try {
      const q = query(collection(db, path), orderBy('wpm', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const results: LeaderboardEntry[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as LeaderboardEntry;
        // Strictly filter out any fake or seed bot records
        if (!data.id?.startsWith('seed-') && !data.userId?.startsWith('bot-')) {
          results.push(data);
        }
      });

      return results.sort((a, b) => b.wpm - a.wpm);
    } catch {
      return [];
    }
  },

  /**
   * Realtime subscription for genuine real user leaderboard rankings.
   */
  subscribeLeaderboard(callback: (entries: LeaderboardEntry[]) => void): () => void {
    const path = 'leaderboard';
    try {
      const q = query(collection(db, path), orderBy('wpm', 'desc'), limit(50));
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const results: LeaderboardEntry[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as LeaderboardEntry;
            // Strictly filter out any fake / seed bot records
            if (!data.id?.startsWith('seed-') && !data.userId?.startsWith('bot-')) {
              results.push(data);
            }
          });
          callback(results.sort((a, b) => b.wpm - a.wpm));
        },
        error => {
          console.warn('Leaderboard realtime subscription error:', error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch {
      callback([]);
      return () => {};
    }
  },

  /**
   * Check if current user is allowed to change username (once per 30 days).
   */
  getUsernameChangeStatus(): {
    canChange: boolean;
    remainingDays: number;
    nextAllowedDate?: string;
  } {
    const profile = this.getLocalProfile();
    if (!profile?.lastUsernameChangeDate) {
      return { canChange: true, remainingDays: 0 };
    }

    const lastChangeTime = new Date(profile.lastUsernameChangeDate).getTime();
    if (isNaN(lastChangeTime)) {
      return { canChange: true, remainingDays: 0 };
    }

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const elapsed = now - lastChangeTime;

    if (elapsed >= thirtyDaysMs) {
      return { canChange: true, remainingDays: 0 };
    }

    const remainingMs = thirtyDaysMs - elapsed;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    const nextDate = new Date(lastChangeTime + thirtyDaysMs).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      canChange: false,
      remainingDays,
      nextAllowedDate: nextDate
    };
  },

  /**
   * Updates user username and favorite public quote.
   * Enforces 30-day (1 month) cooldown on username changes.
   * Favorite quote can be updated freely anytime.
   */
  async updateUsernameAndQuote(newUsername: string, newQuote: string): Promise<{
    success: boolean;
    error?: string;
    remainingDays?: number;
    profile: UserProfile;
  }> {
    const currentProfile = this.getLocalProfile() || {
      uid: auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: auth.currentUser?.displayName || 'Pro Typist',
      bestWpm: 0,
      bestCpm: 0,
      testsCompleted: 0,
      averageAccuracy: 100,
      updatedAt: new Date().toISOString()
    };

    const trimmedName = newUsername.trim();
    const trimmedQuote = newQuote.trim().slice(0, 150);
    const isNameChanging = Boolean(trimmedName && trimmedName !== currentProfile.displayName);

    if (isNameChanging) {
      if (trimmedName.length < 2 || trimmedName.length > 25) {
        return {
          success: false,
          error: 'ইউজারনেম ২ থেকে ২৫ অক্ষরের মধ্যে হতে হবে।',
          profile: currentProfile
        };
      }

      // Check 30-day cooldown
      if (currentProfile.lastUsernameChangeDate) {
        const lastChangeTime = new Date(currentProfile.lastUsernameChangeDate).getTime();
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const elapsed = now - lastChangeTime;

        if (elapsed < thirtyDaysMs) {
          const remainingMs = thirtyDaysMs - elapsed;
          const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
          return {
            success: false,
            error: `ইউজারনেম মাসে কেবল একবার পরিবর্তন করা যায়। পরবর্তী পরিবর্তন সম্ভব ${remainingDays} দিন পর।`,
            remainingDays,
            profile: currentProfile
          };
        }
      }
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      displayName: trimmedName || currentProfile.displayName,
      favoriteQuote: trimmedQuote,
      lastUsernameChangeDate: isNameChanging ? new Date().toISOString() : currentProfile.lastUsernameChangeDate,
      updatedAt: new Date().toISOString()
    };

    // Save locally
    this.saveLocalProfile(updatedProfile);

    // If authenticated, sync to Firestore user doc and all leaderboard entries
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });

        // Update all leaderboard documents created by this user
        const q = query(collection(db, 'leaderboard'), orderBy('wpm', 'desc'));
        const snap = await getDocs(q);
        const updates: Promise<any>[] = [];
        snap.forEach(docSnap => {
          const data = docSnap.data() as LeaderboardEntry;
          if (data.userId === user.uid) {
            updates.push(
              setDoc(doc(db, 'leaderboard', docSnap.id), {
                displayName: updatedProfile.displayName,
                favoriteQuote: updatedProfile.favoriteQuote || ''
              }, { merge: true })
            );
          }
        });
        await Promise.all(updates);
      } catch (error) {
        console.warn('Failed syncing profile/leaderboard updates to cloud', error);
      }
    }

    return {
      success: true,
      profile: updatedProfile
    };
  },

  async syncAllLocalDataToCloud(): Promise<{ syncedSessions: number; syncedTexts: number }> {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be signed in to sync data to cloud.');

    const sessions = this.getLocalSessions();
    const texts = this.getLocalCustomTexts();
    let syncedSessions = 0;
    let syncedTexts = 0;

    for (const session of sessions) {
      try {
        await this.syncSessionToCloud(session);
        syncedSessions++;
      } catch (e) {
        console.warn('Failed syncing session', session.id, e);
      }
    }

    for (const text of texts) {
      try {
        const textPath = `users/${user.uid}/custom_texts/${text.id}`;
        await setDoc(doc(db, 'users', user.uid, 'custom_texts', text.id), {
          ...text,
          userId: user.uid
        });
        syncedTexts++;
      } catch (e) {
        console.warn('Failed syncing custom text', text.id, e);
      }
    }

    return { syncedSessions, syncedTexts };
  },

  // Export full user JSON data for offline backup
  exportBackupJSON(): string {
    const sessions = this.getLocalSessions();
    const customTexts = this.getLocalCustomTexts();
    const profile = this.getLocalProfile();
    const backup = {
      app: 'KeyPulse',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      sessions,
      customTexts
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore user data from JSON backup file
  importBackupJSON(jsonStr: string): { sessionsRestored: number; textsRestored: number } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');

      let sessionsRestored = 0;
      let textsRestored = 0;

      if (Array.isArray(data.sessions)) {
        const current = this.getLocalSessions();
        const merged = [...data.sessions];
        for (const s of current) {
          if (!merged.some(m => m.id === s.id)) {
            merged.push(s);
          }
        }
        localStorage.setItem(LOCAL_STORAGE_SESSIONS, JSON.stringify(merged.slice(0, 500)));
        sessionsRestored = data.sessions.length;
      }

      if (Array.isArray(data.customTexts)) {
        const current = this.getLocalCustomTexts();
        const merged = [...data.customTexts];
        for (const t of current) {
          if (!merged.some(m => m.id === t.id)) {
            merged.push(t);
          }
        }
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_TEXTS, JSON.stringify(merged));
        textsRestored = data.customTexts.length;
      }

      return { sessionsRestored, textsRestored };
    } catch (e) {
      throw new Error('Failed to parse backup file: ' + (e instanceof Error ? e.message : 'Invalid data'));
    }
  }
};
