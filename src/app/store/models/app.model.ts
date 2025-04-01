import { VideoQuality } from '../../models/quality.model';
import { SavedVideo } from '../../models/video.model';

export interface AppStateModel {
  videos: SavedVideo[];
  currentQuality: VideoQuality;
  bandwidth: number | null;
  isRecording: boolean;
  isSettingsOpen: boolean;
  recordingTime: number;
}
