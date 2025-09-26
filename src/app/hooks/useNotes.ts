"use client";


import { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setNotes,
  setLoading,
  setError,
  addNote,
  setSelectedNote,
  setEditorVisible,
  setTempNotes,
  updateTempNoteContent,
  addTempNoteFollowUpQuestion,
  addTempNoteFollowUpAnswer,
  TempNote,
  addTempNote,
  syncNoteAfterSave,
  Note,
} from "../store/slices/notesSlice";

export function useNotes() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const userId = session?.user?.userId;

  const { notes, selectedNote, isLoading, isEditorVisible, tempNotes } =
    useAppSelector((state) => state.notes);

  const tempNote =
    tempNotes.length > 0 ? tempNotes[0] : { id: "", keyword: "", content: "" };

  // -----------------------------
  // Fetch notes
  // -----------------------------
  const hasFetchedRef = useRef(false);

  const fetchNotes = useCallback(
    async (force = false) => {
      if (!userId) return;
      if (!force && (notes.length > 0 || hasFetchedRef.current)) return;

      hasFetchedRef.current = true; // ✅ mark as fetched
      dispatch(setLoading(true));

      try {
        const response = await fetch(`/api/notes?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch notes");
        const data = await response.json();
        console.log("when i called")
        dispatch(setNotes(data));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        dispatch(setError(errorMessage));
        console.error(err);
      } finally {

        dispatch(setLoading(false));

      }
    },
    [userId, dispatch, notes.length]
  );
  // -----------------------------
  // Generate temporary note
  // -----------------------------
  const handleNoteGenerated = async (keyword: string, content: string) => {
    try {
      const newNote = {
        keyword,
        content,
        id: Date.now(), // temporary ID
        saved: false,
        created_at: new Date().toISOString(),
        tags: [],
      };
      dispatch(addNote(newNote));
      dispatch(setSelectedNote(newNote));
      dispatch(setEditorVisible(false));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      dispatch(setError(errorMessage));
      console.error(err);
    }
  };

  // -----------------------------
  // Save note (create or update)
  // -----------------------------
  const handleSaveNote = async ({
    keyword,
    content,
    tags = [],
  }: {
    keyword: string;
    content: string;
    tags: string[]; // optional, can be undefined
  }) => {
    if (!selectedNote || !userId) return;

    try {
      const payload = { keyword, content, tags, userId };
      console.log("aaaaatagssss", tags)
      let response;
      if (selectedNote.saved) {
        // Update existing note
        response = await fetch(`/api/notes/${selectedNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new note
        response = await fetch(`/api/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error("Failed to save note");

      const savedNote = await response.json();
      dispatch(syncNoteAfterSave({ oldId: selectedNote.id, savedNote }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      dispatch(setError(errorMessage));
      console.error(err);
    }
  };



  // -----------------------------
  // Return everything
  // -----------------------------
  return {
    notes,
    selectedNote,
    isLoading,
    isEditorVisible,
    tempNotes,
    tempNote,
    addTempNote,
    fetchNotes,
    handleNoteGenerated,
    handleSaveNote,
    setTempNotes: (notes: TempNote[]) => dispatch(setTempNotes(notes)),
    setSelectedNote: (note: Note) => dispatch(setSelectedNote(note)),
    setEditorVisible: (visible: boolean) => dispatch(setEditorVisible(visible)),
    updateTempNoteContent: (payload: { id: string | number; content: string }) =>
      dispatch(updateTempNoteContent(payload)),
    addTempNoteFollowUpQuestion: (payload: {
      id: string | number;
      followupQuestion: string;
    }) => dispatch(addTempNoteFollowUpQuestion(payload)),
    addTempNoteFollowUpAnswer: (payload: {
      id: string | number;
      followupAnswer: string;
    }) => dispatch(addTempNoteFollowUpAnswer(payload)),
  };
}
