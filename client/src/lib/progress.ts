import type { Assignment } from "@shared/schema";

export interface LessonDay {
  day: number;
  title: string;
  itemCount: number;
  focus: string;
  cleaning: boolean;
  reverse: boolean;
}

export const curriculum: LessonDay[] = [
  { day: 1, title: "The Foundation", itemCount: 3, focus: "Vivid Imagery", cleaning: false, reverse: false },
  { day: 2, title: "The Expansion", itemCount: 5, focus: "Making Space", cleaning: true, reverse: false },
  { day: 3, title: "The Reverse", itemCount: 5, focus: "Mental Agility", cleaning: true, reverse: true },
  { day: 4, title: "The Stretch", itemCount: 8, focus: "Volume", cleaning: true, reverse: false },
  { day: 5, title: "The Graduation", itemCount: 10, focus: "Mastery", cleaning: true, reverse: true },
];

export function getLessonDay(dayNumber: number): LessonDay {
  const idx = Math.min(dayNumber, curriculum.length) - 1;
  if (idx < 0) return curriculum[0];
  return curriculum[idx];
}

export interface SessionRecord {
  date: string;
  day: number;
  score: number;
  totalItems: number;
  assignments: Assignment[];
  placeName: string;
  stops: string[];
}

export interface UserProgress {
  userName: string;
  currentDay: number;
  sessions: SessionRecord[];
  hasSeenEducation: boolean;
}

const STORAGE_KEY = "memoryamble_progress";

const DEFAULT_PROGRESS: UserProgress = {
  userName: "",
  currentDay: 1,
  sessions: [],
  hasSeenEducation: false,
};

export function loadProgress(): UserProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getLastSession(progress: UserProgress): SessionRecord | null {
  if (progress.sessions.length === 0) return null;
  return progress.sessions[progress.sessions.length - 1];
}

export function getYesterdaySession(progress: UserProgress): SessionRecord | null {
  const last = getLastSession(progress);
  if (!last) return null;
  if (last.date === yesterdayStr()) return last;
  return null;
}

export function hasCompletedToday(progress: UserProgress): boolean {
  const last = getLastSession(progress);
  if (!last) return false;
  return last.date === todayStr();
}

export function recordSession(
  progress: UserProgress,
  session: Omit<SessionRecord, "date">
): UserProgress {
  const record: SessionRecord = { ...session, date: todayStr() };
  const nextDay = Math.min(progress.currentDay + 1, curriculum.length);

  return {
    ...progress,
    currentDay: nextDay,
    sessions: [...progress.sessions, record],
  };
}

export function initProgress(userName: string): UserProgress {
  return {
    ...DEFAULT_PROGRESS,
    userName,
    hasSeenEducation: true,
  };
}
