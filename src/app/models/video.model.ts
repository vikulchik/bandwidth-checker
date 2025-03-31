export enum VideoQuality {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export interface Video {
    id: string;
    url: string;
    thumbnail?: string;
    quality: VideoQuality;
    createdAt: Date;
    duration: number;
}

export interface SavedVideo {
    id: string;
    blobData: ArrayBuffer;
    timestamp: number;
    duration: number;
    quality: VideoQuality;
}
