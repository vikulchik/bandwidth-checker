import { VideoQuality } from '../../models/quality.model';
import { SavedVideo } from '../../models/video.model';

// Video Actions
export class SaveVideo {
  static readonly type = '[App] Save Video';

  constructor(public video: SavedVideo) {}
}

export class DeleteVideo {
  static readonly type = '[App] Delete Video';

  constructor(public id: string) {}
}

export class LoadVideos {
  static readonly type = '[App] Load Videos';
}

export class ClearVideos {
  static readonly type = '[App] Clear Videos';
}

// Quality Actions
export class SetQuality {
  static readonly type = '[App] Set Quality';

  constructor(public quality: VideoQuality) {}
}

// Bandwidth Actions
export class SetBandwidth {
  static readonly type = '[App] Set Bandwidth';

  constructor(public bandwidth: number | null) {}
}

// Recording Actions
export class StartRecording {
  static readonly type = '[App] Start Recording';
}

export class StopRecording {
  static readonly type = '[App] Stop Recording';
}

export class UpdateRecordingTime {
  static readonly type = '[App] Update Recording Time';

  constructor(public time: number) {}
}

// Settings Actions
export class ToggleSettings {
  static readonly type = '[App] Toggle Settings';
}

export class ResetRecordingTime {
  static readonly type = '[App] Reset Recording Time';
}
