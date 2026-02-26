import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase-config";
import { type GalleryImage, WEDDING_DETAILS } from "./wedding-config";

const CONFIG_DOC_ID = "wedding_details";

export const fetchWeddingDetails = async () => {
  try {
    const docRef = doc(db, "config", CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error fetching wedding details:", error);
  }
  return WEDDING_DETAILS;
};

export const updateWeddingDetails = async (data: any) => {
  const docRef = doc(db, "config", CONFIG_DOC_ID);
  await setDoc(docRef, data, { merge: true });
};

export const fetchGalleryImages = async () => {
  const q = query(collection(db, "gallery"), orderBy("created_at", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryImage[];
};

export const addGalleryImage = async (image: Omit<GalleryImage, 'id'>) => {
  const docRef = await addDoc(collection(db, "gallery"), {
    ...image,
    created_at: new Date().toISOString()
  });
  return docRef.id;
};

export const deleteGalleryImage = async (id: string) => {
  await deleteDoc(doc(db, "gallery", id));
};
