import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { AppState } from '../../store/state/app.state';
import { Observable } from 'rxjs';
import { DeleteVideo } from '../../store/actions/app.actions';
import { SavedVideo } from '../../models/video.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss'],
})
export class VideoListComponent implements OnDestroy {
  @Select(AppState.videos) videos$!: Observable<SavedVideo[]>;
  @Select(AppState.hasRecordedVideos) hasRecordedVideos$!: Observable<boolean>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  private videoUrlCache = new Map<string, string>();
  selectedVideo: (SavedVideo & { url: string }) | null = null;

  isPlaying = false;
  progress = 0;
  currentTime = 0;
  duration = 0;

  constructor(
    private store: Store,
    private dialog: MatDialog
  ) {
    // Subscribe to video changes to clear cache
    this.videos$.subscribe(videos => {
      // Clean up URLs for deleted videos
      const currentIds = new Set(videos.map(v => v.id));
      for (const [id] of this.videoUrlCache) {
        if (!currentIds.has(id)) {
          const url = this.videoUrlCache.get(id);
          if (url) {
            URL.revokeObjectURL(url);
            this.videoUrlCache.delete(id);
          }
        }
      }
    });
  }

  getVideoUrl(video: SavedVideo): string {
    // Check the cache
    let url = this.videoUrlCache.get(video.id);
    if (!url) {
      // If the URL is not in the cache, create a new one
      const blob = new Blob([video.blobData], { type: 'video/webm' });
      url = URL.createObjectURL(blob);
      this.videoUrlCache.set(video.id, url);
    }
    return url;
  }

  async deleteVideo(videoId: string): Promise<void> {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      panelClass: 'delete-dialog-container',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Clean the URL before deleting
        const url = this.videoUrlCache.get(videoId);
        if (url) {
          URL.revokeObjectURL(url);
          this.videoUrlCache.delete(videoId);
        }
        this.store.dispatch(new DeleteVideo(videoId));
      }
    });
  }

  playVideo(video: SavedVideo): void {
    const url = this.getVideoUrl(video);
    this.selectedVideo = { ...video, url };
    this.duration = video.duration;
  }

  closeVideo(): void {
    if (this.videoPlayer && this.isPlaying) {
      this.videoPlayer.nativeElement.pause();
    }
    this.selectedVideo = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.progress = 0;
  }

  onTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.currentTime = Math.floor(video.currentTime);

    if (this.duration > 0 && isFinite(this.duration)) {
      let calculated = (video.currentTime / this.duration) * 100;
      // Limit progress value between 0 and 100
      this.progress = Math.min(100, Math.max(0, calculated));
    }
  }

  togglePlay() {
    if (this.videoPlayer) {
      if (this.isPlaying) {
        this.videoPlayer.nativeElement.pause();
      } else {
        this.videoPlayer.nativeElement.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }

  onProgressClick(event: MouseEvent) {
    if (this.videoPlayer && this.duration > 0 && isFinite(this.duration)) {
      const progressBar = event.currentTarget as HTMLElement;
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = x / rect.width;
      this.videoPlayer.nativeElement.currentTime = percentage * this.duration;
    } else {
    }
  }

  onVideoEnded() {
    // When video ends, update state to "not playing"
    this.isPlaying = false;
    console.log('Video playback ended');
  }

  onVideoItemLoaded(video: SavedVideo): void {
    console.log(`Video ${video.id} metadata loaded`);
  }

  onVideoLoaded() {
    console.log('Video player metadata loaded');
    if (!this.duration && this.videoPlayer) {
      const videoDuration = this.videoPlayer.nativeElement.duration;
      if (isFinite(videoDuration) && !isNaN(videoDuration)) {
        this.duration = Math.floor(videoDuration);
        console.log('Updated duration from video element:', this.duration);
      }
    }
  }

  ngOnDestroy(): void {
    // Clear all URLs when the component is destroyed
    for (const url of this.videoUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.videoUrlCache.clear();
  }
}
