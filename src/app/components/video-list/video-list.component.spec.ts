import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoListComponent } from './video-list.component';
import { Store } from '@ngxs/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { SavedVideo, VideoQuality } from '../../models/video.model';
import { DeleteVideo, PlayVideo, CloseVideo } from '../../store/video.actions';
import { of } from 'rxjs';

describe('VideoListComponent', () => {
  let component: VideoListComponent;
  let fixture: ComponentFixture<VideoListComponent>;
  let store: jasmine.SpyObj<Store>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockVideos: SavedVideo[] = [
    {
      id: '1',
      blobData: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer,
      timestamp: 1234567890,
      duration: 5,
      quality: VideoQuality.HIGH
    },
    {
      id: '2',
      blobData: new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]).buffer,
      timestamp: 1234567891,
      duration: 3,
      quality: VideoQuality.MEDIUM
    }
  ];

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    storeSpy.select.and.returnValue(of(mockVideos));

    await TestBed.configureTestingModule({
      declarations: [VideoListComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load videos from store', () => {
    expect(component.videos$).toBeTruthy();
    component.videos$.subscribe(videos => {
      expect(videos).toEqual(mockVideos);
    });
  });

  describe('deleteVideo', () => {
    it('should open delete dialog and handle confirmation', () => {
      const dialogRef = {
        afterClosed: () => of(true),
        close: () => { },
        _containerInstance: {},
        componentInstance: {},
        disableClose: false,
        _ref: {}
      };

      dialog.open.and.returnValue(dialogRef as any);

      component.deleteVideo(mockVideos[0].id);

      expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, {
        width: '400px',
        data: { video: mockVideos[0] }
      });

      expect(store.dispatch).toHaveBeenCalledWith(new DeleteVideo(mockVideos[0].id));
    });

    it('should not delete video if dialog is cancelled', () => {
      const dialogRef = {
        afterClosed: () => of(false),
        close: () => { },
        _containerInstance: {},
        componentInstance: {},
        disableClose: false,
        _ref: {}
      };

      dialog.open.and.returnValue(dialogRef as any);

      component.deleteVideo(mockVideos[0].id);

      expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, {
        width: '400px',
        data: { video: mockVideos[0] }
      });

      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('playVideo', () => {
    it('should dispatch PlayVideo action', () => {
      component.playVideo(mockVideos[0]);
      expect(store.dispatch).toHaveBeenCalledWith(new PlayVideo(mockVideos[0].id));
    });
  });

  describe('closeVideo', () => {
    it('should dispatch CloseVideo action', () => {
      component.closeVideo();
      expect(store.dispatch).toHaveBeenCalledWith(new CloseVideo());
    });
  });

  describe('getVideoUrl', () => {
    it('should create and cache video URL', () => {
      const url = component.getVideoUrl(mockVideos[0]);
      expect(url).toBeTruthy();
      expect(url.startsWith('blob:')).toBeTrue();
      expect(component['videoUrlCache'].has(mockVideos[0].id)).toBeTrue();
    });

    it('should return cached URL if exists', () => {
      const url = component.getVideoUrl(mockVideos[0]);
      const cachedUrl = component.getVideoUrl(mockVideos[0]);
      expect(url).toBe(cachedUrl);
    });
  });
});
