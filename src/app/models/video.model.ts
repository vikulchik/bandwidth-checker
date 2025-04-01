import { VideoQuality } from './quality.model';

export interface SavedVideo {
    id: string;
    blobData: ArrayBuffer;
    timestamp: number;
    duration: number;
    quality: VideoQuality;
}
