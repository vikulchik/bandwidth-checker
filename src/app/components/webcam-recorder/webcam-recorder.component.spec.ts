import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WebcamRecorderComponent } from './webcam-recorder.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BandwidthService } from '../../services/bandwidth/bandwidth.service';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { VideoQuality } from '../../models/quality.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WebcamRecorderComponent', () => {
  let component: WebcamRecorderComponent;
  let fixture: ComponentFixture<WebcamRecorderComponent>;
  let bandwidthService: jasmine.SpyObj<BandwidthService>;
  let store: jasmine.SpyObj<Store>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const bandwidthServiceSpy = jasmine.createSpyObj('BandwidthService', [
      'measureBandwidth',
      'getRecommendedQuality',
    ]);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [WebcamRecorderComponent],
      providers: [
        { provide: BandwidthService, useValue: bandwidthServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    bandwidthService = TestBed.inject(BandwidthService) as jasmine.SpyObj<BandwidthService>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcamRecorderComponent);
    component = fixture.componentInstance;

    // Mock store selects
    store.select.and.returnValue(of(false)); // isRecording$
    store.select.and.returnValue(of(false)); // isSettingsOpen$
    store.select.and.returnValue(of(0)); // recordingTime$
    store.select.and.returnValue(of(VideoQuality.MEDIUM)); // currentQuality$
    store.select.and.returnValue(of(5)); // bandwidth$
    store.select.and.returnValue(of(false)); // hasRecordedVideos$

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initializeWithErrorHandling', () => {
    beforeEach(() => {
      bandwidthService.measureBandwidth.and.returnValue(Promise.resolve(5));
      bandwidthService.getRecommendedQuality.and.returnValue(VideoQuality.MEDIUM);
    });

    it('should initialize webcam and measure bandwidth on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(bandwidthService.measureBandwidth).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
    }));

    it('should handle initialization error', fakeAsync(() => {
      bandwidthService.measureBandwidth.and.returnValue(Promise.reject('Error'));

      component.ngOnInit();
      tick();

      expect(snackBar.open).toHaveBeenCalledWith(jasmine.any(String), 'Close', jasmine.any(Object));
    }));
  });

  describe('recording functionality', () => {
    let mockMediaRecorder: any;
    let mockStream: MediaStream;

    beforeEach(() => {
      mockStream = new MediaStream();
      mockMediaRecorder = {
        start: jasmine.createSpy('start'),
        stop: jasmine.createSpy('stop'),
        ondataavailable: null,
        state: 'inactive',
      };

      spyOn(window.navigator.mediaDevices, 'getUserMedia').and.returnValue(
        Promise.resolve(mockStream)
      );
      spyOn(window, 'MediaRecorder').and.returnValue(mockMediaRecorder);
    });

    it('should start recording when triggered', async () => {
      await component.toggleRecording();
      expect(mockMediaRecorder.start).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should stop recording when triggered', async () => {
      component.mediaRecorder = mockMediaRecorder;
      await component.toggleRecording();
      expect(mockMediaRecorder.stop).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('quality selection', () => {
    it('should update quality when manually selected', () => {
      component.selectQuality(VideoQuality.HIGH);
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should set recommended quality based on bandwidth', () => {
      bandwidthService.getRecommendedQuality.and.returnValue(VideoQuality.HIGH);
      component.selectQuality(VideoQuality.HIGH);
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  it('should cleanup resources on destroy', () => {
    const mockStream = new MediaStream();
    const mockTrack = { stop: jasmine.createSpy('stop') };
    mockStream.addTrack(mockTrack as any);
    component.mediaStream = mockStream;

    component.ngOnDestroy();
    expect(mockTrack.stop).toHaveBeenCalled();
  });
});
