import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { VideoState } from './video.state';
import { SaveVideo, DeleteVideo, PlayVideo, CloseVideo, SetVideoQuality } from './video.actions';
import { SavedVideo, VideoQuality } from '../models/video.model';

describe('VideoState', () => {
  let store: Store;

  const mockVideo: SavedVideo = {
    id: '1',
    blobData: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
    timestamp: Date.now(),
    duration: 5,
    quality: VideoQuality.HIGH,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([VideoState])],
    });

    store = TestBed.inject(Store);
  });

  it('should save video', () => {
    store.dispatch(new SaveVideo(mockVideo));

    const videos = store.selectSnapshot(VideoState.getVideos);
    expect(videos).toEqual([mockVideo]);
  });

  it('should delete video', () => {
    store.dispatch(new SaveVideo(mockVideo));
    store.dispatch(new DeleteVideo(mockVideo.id));

    const videos = store.selectSnapshot(VideoState.getVideos);
    expect(videos).toEqual([]);
  });

  it('should play video', () => {
    store.dispatch(new SaveVideo(mockVideo));
    store.dispatch(new PlayVideo(mockVideo.id));

    const selectedVideo = store.selectSnapshot(VideoState.getSelectedVideo);
    expect(selectedVideo).toEqual(mockVideo);
  });

  it('should close video', () => {
    store.dispatch(new SaveVideo(mockVideo));
    store.dispatch(new PlayVideo(mockVideo.id));
    store.dispatch(new CloseVideo());

    const selectedVideo = store.selectSnapshot(VideoState.getSelectedVideo);
    expect(selectedVideo).toBeNull();
  });

  it('should set video quality', () => {
    store.dispatch(new SetVideoQuality(VideoQuality.LOW));

    const quality = store.selectSnapshot(VideoState.getQuality);
    expect(quality).toBe(VideoQuality.LOW);
  });

  it('should persist videos between sessions', () => {
    store.dispatch(new SaveVideo(mockVideo));

    // Simulate page reload
    const state = store.snapshot();
    store.reset(state);

    const videos = store.selectSnapshot(VideoState.getVideos);
    expect(videos).toEqual([mockVideo]);
  });
});
