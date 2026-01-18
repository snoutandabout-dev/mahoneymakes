import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { firebaseDb } from "./client";

export interface CalendarEventRecord {
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string;
  is_completed: boolean;
  color: string;
  created_at?: string;
  updated_at?: string;
}

const CALENDAR = "calendar_events";

export const listEventsByMonth = async (startISO: string, endISO: string) => {
  const q = query(
    collection(firebaseDb, CALENDAR),
    where("event_date", ">=", startISO),
    where("event_date", "<=", endISO),
    orderBy("event_date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CalendarEventRecord) }));
};

export const addCalendarEvent = async (event: CalendarEventRecord) => {
  const now = new Date().toISOString();
  await addDoc(collection(firebaseDb, CALENDAR), { ...event, created_at: now, updated_at: now });
};

export const toggleCalendarEventComplete = async (id: string, isCompleted: boolean) => {
  const now = new Date().toISOString();
  await updateDoc(doc(firebaseDb, CALENDAR, id), { is_completed: isCompleted, updated_at: now });
};

export const deleteCalendarEvent = async (id: string) => {
  await deleteDoc(doc(firebaseDb, CALENDAR, id));
};
