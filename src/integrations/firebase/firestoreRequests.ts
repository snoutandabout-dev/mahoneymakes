import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseDb } from "./client";

export interface FirestoreOrderRequest {
  budget: string | null;
  cake_type: string;
  created_at: string;
  customer_email: string | null;
  customer_name: string;
  customer_phone: string;
  event_date: string;
  event_type: string | null;
  request_details: string | null;
  servings: number | null;
  status: string;
  updated_at?: string;
}

export interface FirestoreRequestImage {
  image_url: string;
  request_id: string;
  created_at?: string;
}

export interface OrderVisionImageInput {
  order_id: string;
  image_url: string;
  caption: string | null;
  user_id: string;
  created_at?: string;
}

export const listOrderRequests = async () => {
  const requestsRef = collection(firebaseDb, "order_requests");
  const q = query(requestsRef, orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as FirestoreOrderRequest) }));
};

export const listRequestImages = async (requestId: string) => {
  const imagesRef = collection(firebaseDb, "order_request_images");
  const q = query(imagesRef, where("request_id", "==", requestId));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as FirestoreRequestImage) }));
};

export const setOrderRequestStatus = async (requestId: string, newStatus: string) => {
  const ref = doc(firebaseDb, "order_requests", requestId);
  await updateDoc(ref, { status: newStatus, updated_at: new Date().toISOString() });
};

export const deleteOrderRequest = async (requestId: string) => {
  const ref = doc(firebaseDb, "order_requests", requestId);
  await deleteDoc(ref);
};

export const convertRequestToOrder = async (
  requestId: string,
  request: FirestoreOrderRequest & { id?: string },
  userId: string,
  requestImages: FirestoreRequestImage[],
) => {
  const batch = writeBatch(firebaseDb);

  const orderRef = doc(collection(firebaseDb, "orders"));
  const now = new Date().toISOString();

  batch.set(orderRef, {
    user_id: userId,
    customer_name: request.customer_name,
    customer_email: request.customer_email,
    customer_phone: request.customer_phone,
    cake_type: request.cake_type,
    event_type: request.event_type,
    event_date: request.event_date,
    servings: request.servings,
    order_notes: request.request_details,
    status: "pending",
    deposit_amount: 0,
    total_amount: 0,
    created_at: now,
    updated_at: now,
  });

  if (requestImages.length > 0) {
    requestImages.forEach((img) => {
      const visionRef = doc(collection(firebaseDb, "order_vision_images"));
      batch.set(visionRef, {
        order_id: orderRef.id,
        image_url: img.image_url,
        caption: null,
        user_id: userId,
        created_at: now,
      } satisfies OrderVisionImageInput);
    });
  }

  const requestRef = doc(firebaseDb, "order_requests", requestId);
  batch.update(requestRef, { status: "confirmed", updated_at: now });

  await batch.commit();

  return orderRef.id;
};
