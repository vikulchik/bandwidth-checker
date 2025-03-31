import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { VideoQuality } from '../../models/quality.model';
import { AppStateModel, SavedVideo } from '../models/app.model';
import {
  SaveVideo,
  DeleteVideo,
  LoadVideos,
  ClearVideos,
  SetQuality,
  SetBandwidth,
  StartRecording,
  StopRecording,
  UpdateRecordingTime,
  ToggleSettings,
  ResetRecordingTime
} from '../actions/app.actions';
import { StorageService } from '../../services/storage.service';

const defaults: AppStateModel = {
  videos: [],
  currentQuality: VideoQuality.MEDIUM,
  bandwidth: null,
  isRecording: false,
  isSettingsOpen: false,
  recordingTime: 0
};

@State<AppStateModel>({
  name: 'app',
  defaults
})
@Injectable()
export class AppState {
  constructor(private storageService: StorageService) {
  }

  @Selector()
  static videos(state: AppStateModel): SavedVideo[] {
    return state.videos;
  }

  @Selector()
  static hasRecordedVideos(state: AppStateModel): boolean {
    return state.videos.length > 0;
  }

  @Selector()
  static currentQuality(state: AppStateModel): VideoQuality {
    return state.currentQuality;
  }

  @Selector()
  static bandwidth(state: AppStateModel): number | null {
    return state.bandwidth;
  }

  @Selector()
  static isRecording(state: AppStateModel): boolean {
    return state.isRecording;
  }

  @Selector()
  static recordingTime(state: AppStateModel): number {
    return state.recordingTime;
  }

  @Selector()
  static isSettingsOpen(state: AppStateModel): boolean {
    return state.isSettingsOpen;
  }

  @Action(LoadVideos)
  async loadVideos(ctx: StateContext<AppStateModel>) {
    try {
      const videos = await this.storageService.getAllVideos();
      ctx.patchState({ videos });
    } catch (error) {
      console.error('Error loading videos:', error);
      ctx.patchState({ videos: [] });
    }
  }

  @Action(SaveVideo)
  async saveVideo(ctx: StateContext<AppStateModel>, action: SaveVideo) {
    try {
      await this.storageService.saveVideo(action.video);
      const state = ctx.getState();
      ctx.patchState({
        videos: [...state.videos, action.video]
      });
    } catch (error) {
      console.error('Error saving video:', error);
      throw error;
    }
  }

  @Action(DeleteVideo)
  async deleteVideo(ctx: StateContext<AppStateModel>, action: DeleteVideo) {
    try {
      await this.storageService.deleteVideo(action.id);
      const state = ctx.getState();
      ctx.patchState({
        videos: state.videos.filter(video => video.id !== action.id)
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  @Action(ClearVideos)
  async clearVideos(ctx: StateContext<AppStateModel>) {
    try {
      await this.storageService.clearAllVideos();
      ctx.patchState({ videos: [] });
    } catch (error) {
      console.error('Error clearing videos:', error);
      throw error;
    }
  }

  @Action(SetQuality)
  setQuality(ctx: StateContext<AppStateModel>, action: SetQuality) {
    ctx.patchState({ currentQuality: action.quality });
  }

  @Action(SetBandwidth)
  setBandwidth(ctx: StateContext<AppStateModel>, action: SetBandwidth) {
    ctx.patchState({ bandwidth: action.bandwidth });
  }

  @Action(StartRecording)
  startRecording(ctx: StateContext<AppStateModel>) {
    ctx.patchState({
      isRecording: true,
      recordingTime: 0
    });
  }

  @Action(StopRecording)
  stopRecording(ctx: StateContext<AppStateModel>) {
    ctx.patchState({
      isRecording: false,
      recordingTime: 0
    });
  }

  @Action(UpdateRecordingTime)
  updateRecordingTime(ctx: StateContext<AppStateModel>, action: UpdateRecordingTime) {
    ctx.patchState({ recordingTime: action.time });
  }

  @Action(ToggleSettings)
  toggleSettings(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    ctx.patchState({ isSettingsOpen: !state.isSettingsOpen });
  }

  @Action(ResetRecordingTime)
  resetRecordingTime(ctx: StateContext<AppStateModel>) {
    ctx.patchState({
      recordingTime: 0
    });
  }
}
