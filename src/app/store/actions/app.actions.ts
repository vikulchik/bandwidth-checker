import { VideoQuality } from '../../models/quality.model';
import { SavedVideo } from '../models/app.model';

// Video Actions
export class SaveVideo {
  static readonly type = '[Video] Save Video';

  constructor(public video: SavedVideo) {
  }
}

export class DeleteVideo {
  static readonly type = '[Video] Delete Video';

  constructor(public id: string) {
  }
}

export class LoadVideos {
  static readonly type = '[Video] Load Videos';
}

export class ClearVideos {
  static readonly type = '[Video] Clear Videos';
}

// Quality Actions
export class SetQuality {
  static readonly type = '[Quality] Set Quality';

  constructor(public quality: VideoQuality) {
  }
}

// Bandwidth Actions
export class SetBandwidth {
  static readonly type = '[App] Set Bandwidth';

  constructor(public bandwidth: number | null) {
  }
}

// Recording Actions
export class StartRecording {
  static readonly type = '[Recording] Start Recording';
}

export class StopRecording {
  static readonly type = '[Recording] Stop Recording';
}

export class UpdateRecordingTime {
  static readonly type = '[Recording] Update Time';

  constructor(public time: number) {
  }
}

// Settings Actions
export class ToggleSettings {
  static readonly type = '[Settings] Toggle Settings';
}

export class ResetRecordingTime {
  static readonly type = '[App] Reset Recording Time';
}
