import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseDb } from "./client";

export interface MenuItemRecord {
  category: string;
  name: string;
  description: string | null;
  price: string;
  is_available: boolean;
  display_order: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const MENU_COLLECTION = "menu_items";

export const listMenuItems = async (): Promise<Array<MenuItemRecord & { id: string }>> => {
  const ref = collection(firebaseDb, MENU_COLLECTION);
  const q = query(ref, orderBy("display_order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as MenuItemRecord) }));
};

export const createMenuItem = async (item: MenuItemRecord) => {
  const ref = collection(firebaseDb, MENU_COLLECTION);
  const now = new Date().toISOString();
  await addDoc(ref, { ...item, created_at: now, updated_at: now });
};

export const updateMenuItem = async (id: string, patch: Partial<MenuItemRecord>) => {
  const ref = doc(firebaseDb, MENU_COLLECTION, id);
  const now = new Date().toISOString();
  await updateDoc(ref, { ...patch, updated_at: now });
};

export const deleteMenuItemById = async (id: string) => {
  const ref = doc(firebaseDb, MENU_COLLECTION, id);
  await deleteDoc(ref);
};

export const setMenuItemAvailability = async (id: string, isAvailable: boolean) => {
  const ref = doc(firebaseDb, MENU_COLLECTION, id);
  const now = new Date().toISOString();
  await updateDoc(ref, { is_available: isAvailable, updated_at: now });
};

export const listMenuItemsByCategory = async (category: string) => {
  const ref = collection(firebaseDb, MENU_COLLECTION);
  const q = query(ref, where("category", "==", category), orderBy("display_order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as MenuItemRecord) }));
};
