import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { firebaseDb } from "./client";

export interface SupplyRecord {
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const SUPPLIES = "supplies";

export const listSupplies = async () => {
  const q = query(collection(firebaseDb, SUPPLIES), orderBy("category", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SupplyRecord) }));
};

export const createSupply = async (supply: SupplyRecord) => {
  const now = new Date().toISOString();
  const isLow = supply.current_stock <= supply.low_stock_threshold;
  await addDoc(collection(firebaseDb, SUPPLIES), {
    ...supply,
    is_low_stock: isLow,
    created_at: now,
    updated_at: now,
  });
};

export const updateSupply = async (id: string, patch: Partial<SupplyRecord>) => {
  const now = new Date().toISOString();
  const isLow = patch.current_stock !== undefined && patch.low_stock_threshold !== undefined
    ? patch.current_stock <= patch.low_stock_threshold
    : undefined;

  await updateDoc(doc(firebaseDb, SUPPLIES, id), {
    ...patch,
    ...(isLow !== undefined ? { is_low_stock: isLow } : {}),
    updated_at: now,
  });
};

export const deleteSupplyById = async (id: string) => {
  await deleteDoc(doc(firebaseDb, SUPPLIES, id));
};
