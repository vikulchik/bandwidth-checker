import { Injectable } from '@angular/core';
import { SavedVideo } from '../../models/video.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly DB_NAME = 'BandwidthCheckerDB';
  private readonly STORE_NAME = 'videos';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;
  private dbInitialized = false;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    if (this.dbInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Error opening IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.dbInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create storage for video if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureDBInitialized(): Promise<void> {
    if (!this.dbInitialized) {
      await this.initDB();
    }
  }

  async saveVideo(videoData: SavedVideo): Promise<void> {
    await this.ensureDBInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const request = store.put(videoData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllVideos(): Promise<SavedVideo[]> {
    await this.ensureDBInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const videos = request.result;
        resolve(videos);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    await this.ensureDBInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllVideos(): Promise<void> {
    await this.ensureDBInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
