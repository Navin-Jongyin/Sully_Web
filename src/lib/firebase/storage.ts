import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebase';

export async function uploadFile(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export function productImagePath(productId: string, filename: string) {
  return `products/${productId}/${filename}`;
}
