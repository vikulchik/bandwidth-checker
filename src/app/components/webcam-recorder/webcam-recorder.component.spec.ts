import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebcamRecorderComponent } from './webcam-recorder.component';
import { Store } from '@ngxs/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoQuality } from '../../models/quality.model';
import { SaveVideo } from '../../store/video.actions';
import { of } from 'rxjs';

describe('WebcamRecorderComponent', () => {
  let component: WebcamRecorderComponent;
  let fixture: ComponentFixture<WebcamRecorderComponent>;
  let store: jasmine.SpyObj<Store>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let mediaDevicesSpy: jasmine.Spy;

  const mockMediaStream = {
    getTracks: () => [{
      stop: () => { },
      getSettings: () => ({ width: 1920, height: 1080 })
    }]
  };

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    storeSpy.select.and.returnValue(of(VideoQuality.HIGH));

    await TestBed.configureTestingModule({
      declarations: [WebcamRecorderComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    mediaDevicesSpy = spyOn(navigator.mediaDevices, 'getUserMedia')
      .and.returnValue(Promise.resolve(mockMediaStream as MediaStream));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcamRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initializeWebcam', () => {
    it('should initialize camera with correct quality settings', async () => {
      await component.initializeWebcam();

      expect(mediaDevicesSpy).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
    });

    it('should handle camera access error', async () => {
      mediaDevicesSpy.and.returnValue(Promise.reject(new Error('Permission denied')));

      await component.initializeWebcam();

      expect(snackBar.open).toHaveBeenCalledWith(
        'To record video, you must allow access to the camera and microphone.',
        'OK',
        { duration: 5000 }
      );
    });
  });

  describe('recording', () => {
    beforeEach(async () => {
      await component.initializeWebcam();
    });

    it('should update recording state', () => {
      spyOn(window, 'MediaRecorder').and.returnValue({
        start: () => { },
        ondataavailable: () => { },
        onstop: () => { }
      } as any);

      component['startRecording']();

      expect(component.isRecording$).toBeTruthy();
    });

    it('should stop recording after maximum duration', async () => {
      jasmine.clock().install();

      const stopRecordingSpy = spyOn<any>(component, 'stopRecording');
      component['startRecording']();

      jasmine.clock().tick(10000); // Maximum duration

      expect(stopRecordingSpy).toHaveBeenCalled();

      jasmine.clock().uninstall();
    });
  });

  describe('stopRecording', () => {
    it('should save video and dispatch action', async () => {
      const mockBlob = new Blob(['test'], { type: 'video/webm' });
      const mockEvent = { data: mockBlob };

      spyOn(window, 'MediaRecorder').and.returnValue({
        start: () => { },
        stop: () => {
          (this as any).ondataavailable(mockEvent);
          (this as any).onstop();
        }
      } as any);

      await component.initializeWebcam();
      component['startRecording']();
      component['stopRecording']();

      expect(store.dispatch).toHaveBeenCalledWith(jasmine.any(SaveVideo));
    });
  });

  it('should cleanup on destroy', () => {
    const stopSpy = jasmine.createSpy('stop');
    (component as any).stream = {
      getTracks: () => [{ stop: stopSpy }]
    };

    component.ngOnDestroy();
    expect(stopSpy).toHaveBeenCalled();
  });
});
