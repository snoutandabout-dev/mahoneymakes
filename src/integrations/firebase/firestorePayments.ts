import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firebaseDb } from "./client";

export interface PaymentRecord {
  order_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  notes: string | null;
  payment_date: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderSummaryRecord {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  cake_type: string;
  event_date: string;
  total_amount: number | null;
  created_at?: string;
  updated_at?: string;
}

const PAYMENTS = "payments";
const ORDERS = "orders";

export const listPayments = async () => {
  const q = query(collection(firebaseDb, PAYMENTS), orderBy("payment_date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as PaymentRecord) }));
};

export const listOrdersSummary = async () => {
  const q = query(collection(firebaseDb, ORDERS), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderSummaryRecord) }));
};

export const createPayment = async (payment: PaymentRecord) => {
  const now = new Date().toISOString();
  await addDoc(collection(firebaseDb, PAYMENTS), { ...payment, created_at: now, updated_at: now });
};

export const deletePaymentById = async (id: string) => {
  await deleteDoc(doc(firebaseDb, PAYMENTS, id));
};

export const listPaymentsByOrder = async (orderId: string) => {
  const q = query(collection(firebaseDb, PAYMENTS), where("order_id", "==", orderId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as PaymentRecord) }));
};
