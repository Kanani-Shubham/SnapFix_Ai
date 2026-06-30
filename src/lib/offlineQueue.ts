import { reportsRepository } from "../repositories/reports.repository";

export interface QueuedReport {
  id: string; // temp unique client-side id
  report: {
    reporter_profile_id: string;
    category: any;
    severity: any;
    status: any;
    address: string;
    city: string;
    ward: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    description?: string;
  };
  mediaFile?: {
    bucket: "reports" | "report-videos" | "before-after" | "avatars";
    path: string;
    blob: Blob;
    mime: string;
    size: number;
    role: "before" | "after" | "thumbnail" | "ai_overlay";
  };
}

const DB_NAME = "SnapFixOfflineDB";
const STORE_NAME = "reports_queue";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueReport(report: QueuedReport): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(report);
      request.onsuccess = () => {
        console.log("Report queued to IndexedDB successfully:", report.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to queue report in IndexedDB:", error);
  }
}

export async function getQueuedReports(): Promise<QueuedReport[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to retrieve queued reports:", error);
    return [];
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to remove report from IndexedDB queue:", error);
  }
}
