import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SavedVideo, VideoQuality } from '../models/video.model';
import { SaveVideo, DeleteVideo, PlayVideo, CloseVideo, SetVideoQuality } from './video.actions';

export interface VideoStateModel {
    videos: SavedVideo[];
    selectedVideo: SavedVideo | null;
    quality: VideoQuality;
}

@Injectable()
@State<VideoStateModel>({
    name: 'video',
    defaults: {
        videos: [],
        selectedVideo: null,
        quality: VideoQuality.HIGH
    }
})
export class VideoState {
    @Selector()
    static getVideos(state: VideoStateModel): SavedVideo[] {
        return state.videos;
    }

    @Selector()
    static getSelectedVideo(state: VideoStateModel): SavedVideo | null {
        return state.selectedVideo;
    }

    @Selector()
    static getQuality(state: VideoStateModel): VideoQuality {
        return state.quality;
    }

    @Action(SaveVideo)
    saveVideo(ctx: StateContext<VideoStateModel>, action: SaveVideo) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            videos: [...state.videos, action.video]
        });
    }

    @Action(DeleteVideo)
    deleteVideo(ctx: StateContext<VideoStateModel>, action: DeleteVideo) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            videos: state.videos.filter(video => video.id !== action.id),
            selectedVideo: state.selectedVideo?.id === action.id ? null : state.selectedVideo
        });
    }

    @Action(PlayVideo)
    playVideo(ctx: StateContext<VideoStateModel>, action: PlayVideo) {
        const state = ctx.getState();
        const video = state.videos.find(v => v.id === action.id);
        if (video) {
            ctx.setState({
                ...state,
                selectedVideo: video
            });
        }
    }

    @Action(CloseVideo)
    closeVideo(ctx: StateContext<VideoStateModel>) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            selectedVideo: null
        });
    }

    @Action(SetVideoQuality)
    setQuality(ctx: StateContext<VideoStateModel>, action: SetVideoQuality) {
        const state = ctx.getState();
        ctx.setState({
            ...state,
            quality: action.quality
        });
    }
} 