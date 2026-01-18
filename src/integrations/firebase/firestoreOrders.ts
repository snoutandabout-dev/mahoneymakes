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

export interface OrderRecord {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  cake_type: string;
  event_type: string | null;
  event_date: string;
  servings: number | null;
  order_notes: string | null;
  status: string;
  deposit_amount: number;
  total_amount: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VisionImageRecord {
  image_url: string;
  caption: string | null;
  order_id: string;
  user_id?: string;
  created_at?: string;
}

const ORDERS = "orders";
const VISION_IMAGES = "order_vision_images";
const ORDER_SUPPLIES = "order_supplies";
const PAYMENTS = "payments";

export const listOrders = async (): Promise<Array<OrderRecord & { id: string }>> => {
  const q = query(collection(firebaseDb, ORDERS), orderBy("event_date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) }));
};

export const listOrdersByDateRange = async (startISO: string, endISO: string) => {
  const q = query(
    collection(firebaseDb, ORDERS),
    where("event_date", ">=", startISO),
    where("event_date", "<=", endISO),
    orderBy("event_date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) }));
};

export const listVisionImages = async (): Promise<Array<VisionImageRecord & { id: string }>> => {
  const snap = await getDocs(collection(firebaseDb, VISION_IMAGES));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as VisionImageRecord) }));
};

export const createOrder = async (order: OrderRecord) => {
  const now = new Date().toISOString();
  await addDoc(collection(firebaseDb, ORDERS), { ...order, created_at: now, updated_at: now });
};

export const updateOrder = async (id: string, order: OrderRecord) => {
  const ref = doc(firebaseDb, ORDERS, id);
  const now = new Date().toISOString();
  await updateDoc(ref, { ...order, updated_at: now });
};

const deleteCollectionByOrder = async (collectionName: string, orderId: string) => {
  const q = query(collection(firebaseDb, collectionName), where("order_id", "==", orderId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
};

export const deleteOrderCascade = async (orderId: string) => {
  await deleteCollectionByOrder(VISION_IMAGES, orderId);
  await deleteCollectionByOrder(ORDER_SUPPLIES, orderId);
  await deleteCollectionByOrder(PAYMENTS, orderId);
  await deleteDoc(doc(firebaseDb, ORDERS, orderId));
};
