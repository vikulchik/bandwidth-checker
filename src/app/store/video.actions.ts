import { SavedVideo, VideoQuality } from '../models/video.model';

export class SaveVideo {
  static readonly type = '[Video] Save';
  constructor(public video: SavedVideo) {}
}

export class DeleteVideo {
  static readonly type = '[Video] Delete';
  constructor(public id: string) {}
}

export class PlayVideo {
  static readonly type = '[Video] Play';
  constructor(public id: string) {}
}

export class CloseVideo {
  static readonly type = '[Video] Close';
}

export class SetVideoQuality {
  static readonly type = '[Video] Set Quality';
  constructor(public quality: VideoQuality) {}
}
