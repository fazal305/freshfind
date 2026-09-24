const BOOKMARKS_KEY = "freshfind:bookmarks";
const NOTES_KEY = "freshfind:notes";
const CHANGE_EVENT = "freshfind:bookmarks-changed";

function readBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {
    /* storage unavailable (private mode, quota) — bookmarks stay in-memory for this render only */
  }
  document.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function readNotes() {
  try {
    return JSON.parse(sessionStorage.getItem(NOTES_KEY)) ?? {};
  } catch {
    return {};
  }
}

function writeNotes(notes) {
  try {
    sessionStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    /* storage unavailable */
  }
}

function noteKey(type, id) {
  return `${type}:${id}`;
}

export function getBookmarks() {
  return readBookmarks();
}

export function isBookmarked(type, id) {
  return readBookmarks().some((b) => b.type === type && b.id === id);
}

export function toggleBookmark(type, id) {
  const bookmarks = readBookmarks();
  const exists = bookmarks.some((b) => b.type === type && b.id === id);
  const next = exists
    ? bookmarks.filter((b) => !(b.type === type && b.id === id))
    : [...bookmarks, { type, id }];
  writeBookmarks(next);
  return !exists;
}

export function removeBookmark(type, id) {
  writeBookmarks(
    readBookmarks().filter((b) => !(b.type === type && b.id === id)),
  );
}

export function getNote(type, id) {
  return readNotes()[noteKey(type, id)] ?? "";
}

export function setNote(type, id, text) {
  const notes = readNotes();
  if (text) {
    notes[noteKey(type, id)] = text;
  } else {
    delete notes[noteKey(type, id)];
  }
  writeNotes(notes);
}

export function onBookmarksChanged(callback) {
  document.addEventListener(CHANGE_EVENT, callback);
  return () => document.removeEventListener(CHANGE_EVENT, callback);
}
