import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { firebaseDb } from "./client";

export interface InventoryItemRecord {
  item_name: string;
  is_checked: boolean;
  priority?: string | null;
  notes?: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const INVENTORY = "inventory_checklist";

export const listInventoryItems = async () => {
  const q = query(collection(firebaseDb, INVENTORY), orderBy("is_checked", "asc"), orderBy("created_at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as InventoryItemRecord) }));
};

export const addInventoryItem = async (item: InventoryItemRecord) => {
  const now = new Date().toISOString();
  await addDoc(collection(firebaseDb, INVENTORY), { ...item, is_checked: false, created_at: now, updated_at: now });
};

export const updateInventoryItem = async (id: string, patch: Partial<InventoryItemRecord>) => {
  const now = new Date().toISOString();
  await updateDoc(doc(firebaseDb, INVENTORY, id), { ...patch, updated_at: now });
};

export const deleteInventoryItem = async (id: string) => {
  await deleteDoc(doc(firebaseDb, INVENTORY, id));
};
