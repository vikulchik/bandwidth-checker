import {VideoQuality} from '../../models/quality.model';

export interface SavedVideo {
  id: string;
  blobData: ArrayBuffer;
  timestamp: number;
  duration: number;
  quality: string;
}

export interface AppStateModel {
  videos: SavedVideo[];
  currentQuality: VideoQuality;
  bandwidth: number | null;
  isRecording: boolean;
  isSettingsOpen: boolean;
  recordingTime: number;
}
