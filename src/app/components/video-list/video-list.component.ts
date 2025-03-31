import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { AppState } from '../../store/state/app.state';
import { Observable } from 'rxjs';
import { DeleteVideo } from '../../store/actions/app.actions';
import { SavedVideo } from '../../store/models/app.model';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnDestroy {
  @Select(AppState.videos) videos$!: Observable<SavedVideo[]>;
  @Select(AppState.hasRecordedVideos) hasRecordedVideos$!: Observable<boolean>;

  private videoUrlCache = new Map<string, string>();
  selectedVideo: (SavedVideo & { url: string }) | null = null;

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
      panelClass: 'delete-dialog-container'
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
  }

  closeVideo(): void {
    this.selectedVideo = null;
  }

  ngOnDestroy(): void {
    // Clear all URLs when the component is destroyed
    for (const url of this.videoUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.videoUrlCache.clear();
  }
}
