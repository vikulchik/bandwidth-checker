import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { VideoQuality } from '../../models/quality.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BandwidthService } from '../../services/bandwidth/bandwidth.service';
import { Store, Select } from '@ngxs/store';
import { AppState } from '../../store/state/app.state';
import { Observable } from 'rxjs';
import {
  SetQuality,
  SetBandwidth,
  StartRecording,
  StopRecording,
  UpdateRecordingTime,
  ToggleSettings,
  SaveVideo,
  LoadVideos,
  ResetRecordingTime,
} from '../../store/actions/app.actions';
import { SavedVideo } from '../../models/video.model';

@Component({
  selector: 'app-webcam-recorder',
  templateUrl: './webcam-recorder.component.html',
  styleUrls: ['./webcam-recorder.component.scss'],
})
export class WebcamRecorderComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  @Select(AppState.isRecording) isRecording$!: Observable<boolean>;
  @Select(AppState.isSettingsOpen) isSettingsOpen$!: Observable<boolean>;
  @Select(AppState.recordingTime) recordingTime$!: Observable<number>;
  @Select(AppState.currentQuality) currentQuality$!: Observable<VideoQuality>;
  @Select(AppState.bandwidth) bandwidth$!: Observable<number | null>;
  @Select(AppState.hasRecordedVideos) hasRecordedVideos$!: Observable<boolean>;

  isMeasuringBandwidth = false;
  private timer: any = null;
  private chunks: BlobPart[] = [];
  private readonly MAX_RECORDING_TIME = 10;
  private readonly DEFAULT_QUALITY = VideoQuality.MEDIUM;

  mediaStream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;

  qualities = [
    { label: { number: '360p', text: '(Low Quality)' }, value: VideoQuality.LOW },
    { label: { number: '720p', text: '(Medium Quality)' }, value: VideoQuality.MEDIUM },
    { label: { number: '1080p', text: '(High Quality)' }, value: VideoQuality.HIGH },
  ];

  constructor(
    private snackBar: MatSnackBar,
    private bandwidthService: BandwidthService,
    private store: Store
  ) {}

  async ngOnInit() {
    await this.initializeWithErrorHandling();
    this.store.dispatch(new LoadVideos());
  }

  ngOnDestroy() {
    this.stopWebcam();
    this.clearTimer();
  }

  private async initializeWithErrorHandling() {
    try {
      await this.measureBandwidthAndSetQuality();
      // Initialize camera after bandwidth measurement
      console.log('Initializing webcam after bandwidth measurement');
      await this.initializeWebcam();
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  private async measureBandwidthAndSetQuality() {
    if (this.isMeasuringBandwidth) {
      this.showWarning('Speed measurement is already in progress');
      return;
    }

    try {
      this.isMeasuringBandwidth = true;
      const bandwidth = await this.bandwidthService.measureBandwidth();

      if (bandwidth <= 0) {
        throw new Error('Invalid connection speed value');
      }

      const quality = this.bandwidthService.getRecommendedQuality(bandwidth);

      await Promise.all([
        this.store.dispatch(new SetBandwidth(bandwidth)),
        this.store.dispatch(new SetQuality(quality)),
      ]);

      this.showBandwidthMessage(bandwidth, quality);
    } catch (error) {
      this.handleBandwidthError(error);
    } finally {
      this.isMeasuringBandwidth = false;
    }
  }

  private handleBandwidthError(error: any) {
    console.error('Error in speed measurement:', error);

    // Set the default quality to medium
    this.store.dispatch(new SetQuality(this.DEFAULT_QUALITY));
    this.store.dispatch(new SetBandwidth(null));

    let errorMessage = 'Failed to measure connection speed. ';

    if (error instanceof Error) {
      if (error.message.includes('Permission denied')) {
        errorMessage += 'Network access is restricted.';
      } else if (error.message.includes('Network error')) {
        errorMessage += 'Check your internet connection.';
      } else if (error.message.includes('Timeout')) {
        errorMessage += 'Timeout exceeded.';
      } else {
        errorMessage += error.message;
      }
    }

    errorMessage += ' Video quality set to medium.';
    this.showError(errorMessage);
  }

  private handleInitializationError(error: any) {
    console.error('Initialization error:', error);
    this.store.dispatch(new SetQuality(this.DEFAULT_QUALITY));

    // Determine the type of error for more accurate user message
    let errorMessage = 'Failed to initialize the application. ';

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow access to the camera and microphone. ';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'Camera or microphone not found. ';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'The camera or microphone is already in use by another application. ';
      }
    }

    errorMessage += 'Video quality set to medium.';
    this.showError(errorMessage);
  }

  private showBandwidthMessage(bandwidth: number, quality: VideoQuality) {
    const qualityMap = {
      [VideoQuality.LOW]: 'low',
      [VideoQuality.MEDIUM]: 'medium',
      [VideoQuality.HIGH]: 'high',
    };

    const message = `Measured speed: ${bandwidth.toFixed(1)} Mbps.
                    Installed ${qualityMap[quality]} video quality.`;

    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 7000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  private showWarning(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['warning-snackbar'],
    });
  }

  toggleSettings() {
    this.store.dispatch(new ToggleSettings());
  }

  selectQuality(quality: VideoQuality) {
    this.store.dispatch(new SetQuality(quality));
    this.store.dispatch(new ToggleSettings());

    // If the stream is already running, restart it with the new quality
    if (this.mediaStream) {
      this.stopWebcam();
      this.initializeWebcam();
    }
  }

  private async getDefaultCamera(): Promise<string | undefined> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Search for built-in camera by keywords in the name
      const builtInCamera = videoDevices.find(
        device =>
          device.label.toLowerCase().includes('built-in') ||
          device.label.toLowerCase().includes('facetime') ||
          device.label.toLowerCase().includes('integrated') ||
          !device.label.toLowerCase().includes('obs')
      );

      // If built-in camera found - use it, otherwise use the first available one
      return builtInCamera?.deviceId || videoDevices[0]?.deviceId;
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return undefined;
    }
  }

  async initializeWebcam(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.showError('Your browser does not support webcam access.');
        return false;
      }

      const deviceId = await this.getDefaultCamera();
      const constraints = this.getVideoConstraints();

      // Add deviceId to constraints if we found a specific camera
      if (deviceId) {
        constraints.deviceId = { exact: deviceId };
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: true,
      });

      // Initialize MediaRecorder with the stream
      try {
        const options = {
          mimeType: 'video/webm;codecs=vp9',
        };
        this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
        console.log('MediaRecorder initialized successfully');
      } catch (e) {
        console.warn('VP9 codec not supported, trying default codec');
        this.mediaRecorder = new MediaRecorder(this.mediaStream);
      }

      this.videoElement.nativeElement.srcObject = this.mediaStream;
      await this.videoElement.nativeElement.play();
      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.showError('To record video, you must allow access to the camera and microphone.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        this.showError('Camera or microphone not found');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        this.showError('The camera or microphone is already in use by another application');
      } else {
        this.showError('There was an error accessing the camera: ' + error.message);
      }
      console.error('Error accessing webcam:', error);
      return false;
    }
  }

  private getVideoConstraints(): MediaTrackConstraints {
    const constraints: MediaTrackConstraints = {
      // Force use of the front camera
      facingMode: 'user',
    };

    switch (this.store.selectSnapshot(AppState.currentQuality)) {
      case VideoQuality.LOW:
        constraints.width = { ideal: 640 };
        constraints.height = { ideal: 360 };
        break;
      case VideoQuality.MEDIUM:
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
        break;
      case VideoQuality.HIGH:
        constraints.width = { ideal: 1920 };
        constraints.height = { ideal: 1080 };
        break;
    }

    return constraints;
  }

  async toggleRecording() {
    const isRecording = this.store.selectSnapshot(AppState.isRecording);

    if (isRecording) {
      this.stopRecording();
      console.log('stopRecording');
    } else {
      // Initialize the webcam only on the first attempt to record
      if (!this.mediaStream) {
        const initialized = await this.initializeWebcam();
        if (!initialized) return;
      }

      if (this.mediaRecorder) {
        // Start recording
        this.store.dispatch(new StartRecording());
        this.startTimer();

        this.chunks = [];
        this.mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            this.chunks.push(event.data);
          }
        };

        // Get data every second
        this.mediaRecorder.start(1000);
        console.log('Started recording');
      } else {
        this.showError('MediaRecorder not initialized properly');
      }
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Save recording time before stopping
      const finalRecordingTime = this.store.selectSnapshot(AppState.recordingTime);
      console.log('Saving final recording time:', finalRecordingTime);

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.chunks, { type: 'video/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const currentQuality = this.store.selectSnapshot(AppState.currentQuality);

          const videoData: SavedVideo = {
            id: Date.now().toString(),
            blobData: arrayBuffer,
            timestamp: Date.now(),
            duration: finalRecordingTime,
            quality: currentQuality,
          };

          console.log('Saving video with duration:', finalRecordingTime);
          await this.store.dispatch(new SaveVideo(videoData)).toPromise();
          this.chunks = [];
        } catch (error) {
          console.error('Error saving video:', error);
          this.showError('There was an error saving the video');
        }
      };

      // Stop recording
      this.mediaRecorder.stop();
      this.store.dispatch(new StopRecording());
      this.clearTimer();
      this.store.dispatch(new ResetRecordingTime());
    }
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      const currentTime = this.store.selectSnapshot(AppState.recordingTime);
      if (currentTime >= this.MAX_RECORDING_TIME) {
        this.stopRecording();
        return;
      }
      this.store.dispatch(new UpdateRecordingTime(currentTime + 1));
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getQualityLabel(quality: VideoQuality): string {
    const qualityOption = this.qualities.find(q => q.value === quality);
    return qualityOption ? qualityOption.label.text : 'Unknown Quality';
  }

  private stopWebcam() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
      this.mediaRecorder = null;
    }
  }

  private getVideoBitrate(): number {
    const quality = this.store.selectSnapshot(state => state.app.quality) as VideoQuality;
    switch (quality) {
      case VideoQuality.LOW:
        return 500000; // 500 kbps
      case VideoQuality.MEDIUM:
        return 1500000; // 1.5 Mbps
      case VideoQuality.HIGH:
        return 3000000; // 3 Mbps
      default:
        return 1500000;
    }
  }

  private async saveVideo(blob: Blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const video: SavedVideo = {
        id: Date.now().toString(),
        blobData: arrayBuffer,
        timestamp: Date.now(),
        duration: this.store.selectSnapshot(AppState.recordingTime),
        quality: this.store.selectSnapshot(state => state.app.quality) as VideoQuality,
      };

      this.store.dispatch(new SaveVideo(video));
      this.snackBar.open('Video saved successfully', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error saving video:', error);
      this.snackBar.open('Error saving video', 'Close', { duration: 3000 });
    }
  }
}
