import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoListComponent } from './video-list.component';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DeleteVideo } from '../../store/actions/app.actions';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SavedVideo } from '../../models/video.model';
import { VideoQuality } from '../../models/quality.model';

describe('VideoListComponent', () => {
  let component: VideoListComponent;
  let fixture: ComponentFixture<VideoListComponent>;
  let store: jasmine.SpyObj<Store>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockVideos: SavedVideo[] = [
    {
      id: '1',
      blobData: new ArrayBuffer(8),
      timestamp: Date.now(),
      duration: 5,
      quality: VideoQuality.HIGH
    },
    {
      id: '2',
      blobData: new ArrayBuffer(8),
      timestamp: Date.now() + 1000,
      duration: 10,
      quality: VideoQuality.MEDIUM
    }
  ];

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ VideoListComponent ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    store.select.and.returnValue(of(mockVideos));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('video playback', () => {
    it('should play video when clicked', () => {
      const video = mockVideos[0];
      const playSpy = spyOn(HTMLVideoElement.prototype, 'play');
      
      component.playVideo(video);
      
      expect(playSpy).toHaveBeenCalled();
    });

    it('should pause other videos when playing a new one', () => {
      const pauseSpy = spyOn(HTMLVideoElement.prototype, 'pause');
      const video1 = mockVideos[0];
      const video2 = mockVideos[1];

      component.playVideo(video1);
      component.playVideo(video2);

      expect(pauseSpy).toHaveBeenCalled();
    });

    it('should update time and progress on video time update', () => {
      const video = mockVideos[0];
      component.playVideo(video);
      
      const mockEvent = {
        target: {
          currentTime: 2.5,
          duration: 5
        }
      };

      component.onTimeUpdate(mockEvent as any);
      expect(component.currentTime).toBe(2);
      expect(component.progress).toBeGreaterThan(0);
    });

    it('should close video and reset state', () => {
      const video = mockVideos[0];
      component.playVideo(video);
      component.closeVideo();

      expect(component.selectedVideo).toBeNull();
      expect(component.isPlaying).toBeFalse();
      expect(component.currentTime).toBe(0);
      expect(component.progress).toBe(0);
    });
  });

  describe('video deletion', () => {
    it('should open delete confirmation dialog', () => {
      const video = mockVideos[0];
      const dialogRef = { afterClosed: () => of(true) };
      dialog.open.and.returnValue(dialogRef as any);

      component.deleteVideo(video.id);

      expect(dialog.open).toHaveBeenCalled();
    });

    it('should delete video when confirmed', () => {
      const video = mockVideos[0];
      const dialogRef = { afterClosed: () => of(true) };
      dialog.open.and.returnValue(dialogRef as any);

      component.deleteVideo(video.id);

      expect(store.dispatch).toHaveBeenCalledWith(new DeleteVideo(video.id));
    });

    it('should not delete video when cancelled', () => {
      const video = mockVideos[0];
      const dialogRef = { afterClosed: () => of(false) };
      dialog.open.and.returnValue(dialogRef as any);

      component.deleteVideo(video.id);

      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('video sorting', () => {
    it('should sort videos by timestamp in descending order', () => {
      const oldTimestamp = Date.now();
      const newTimestamp = Date.now() + 1000;
      
      const unsortedVideos: SavedVideo[] = [
        {
          id: '1',
          blobData: new ArrayBuffer(8),
          timestamp: oldTimestamp,
          duration: 5,
          quality: VideoQuality.HIGH
        },
        {
          id: '2',
          blobData: new ArrayBuffer(8),
          timestamp: newTimestamp,
          duration: 10,
          quality: VideoQuality.MEDIUM
        }
      ];

      store.select.and.returnValue(of(unsortedVideos));
      fixture = TestBed.createComponent(VideoListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const videos = component.videos$;
      videos.subscribe(sortedVideos => {
        expect(sortedVideos[0].timestamp).toBe(newTimestamp);
        expect(sortedVideos[1].timestamp).toBe(oldTimestamp);
      });
    });
  });

  describe('video URL management', () => {
    it('should create and cache video URLs', () => {
      const video = mockVideos[0];
      const url = component.getVideoUrl(video);
      
      expect(url).toContain('blob:');
      expect(component.getVideoUrl(video)).toBe(url);
    });

    it('should cleanup video URLs on component destroy', () => {
      const video = mockVideos[0];
      const url = component.getVideoUrl(video);
      
      spyOn(URL, 'revokeObjectURL');
      component.ngOnDestroy();
      
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });
  });
});
