import { supabase } from "../lib/supabaseClient";
import { auth } from "../lib/firebaseClient";

export interface UploadProgressCallback {
  (percentage: number): void;
}

export const storageService = {
  /**
   * Upload a file to Supabase storage with precise progress updates and abort support
   */
  async uploadFile(params: {
    bucket: "reports" | "report-videos" | "before-after" | "avatars";
    path: string;
    file: File | Blob;
    onProgress?: UploadProgressCallback;
    abortController?: AbortController;
  }): Promise<{ publicUrl: string; path: string }> {
    const { bucket, path, file, onProgress, abortController } = params;

    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
    
    // Clean double slashes in paths if any
    const cleanPath = path.replace(/^\/+/, "");
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${cleanPath}`;

    // Retrieve Firebase ID token for Authorization
    let token = supabaseAnonKey;
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        token = await currentUser.getIdToken();
      }
    } catch (e) {
      console.warn("Could not get Firebase ID token for storage upload:", e);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Check if file already exists first (overwrite mode) or use standard POST/PUT. 
      // Upsert header is required to overwrite in Supabase.
      xhr.open("POST", uploadUrl, true);
      
      xhr.setRequestHeader("apikey", supabaseAnonKey);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "true"); // Allows overwriting/updating existing files
      
      const fileType = file.type || "application/octet-stream";
      xhr.setRequestHeader("Content-Type", fileType);

      // Handle abort signal
      if (abortController) {
        const onAbortSignal = () => {
          xhr.abort();
        };
        abortController.signal.addEventListener("abort", onAbortSignal);
        
        // Clean up event listener on completion
        const cleanup = () => {
          abortController.signal.removeEventListener("abort", onAbortSignal);
        };
        xhr.addEventListener("loadend", cleanup);
      }

      // Real upload progress tracking
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Retrieve the public URL
          const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
          resolve({
            publicUrl: data.publicUrl,
            path: cleanPath
          });
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(errResponse.error || errResponse.message || `Upload failed (Status: ${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with status code ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network connection lost during file upload."));
      };

      xhr.onabort = () => {
        reject(new Error("Upload cancelled by citizen."));
      };

      xhr.send(file);
    });
  },

  /**
   * Generates a unique storage path for a file
   */
  generatePath(fileName: string, prefix: string = ""): string {
    const ext = fileName.split(".").pop() || "png";
    const rand = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    return `${prefix ? prefix + "/" : ""}${timestamp}_${rand}.${ext}`;
  }
};
