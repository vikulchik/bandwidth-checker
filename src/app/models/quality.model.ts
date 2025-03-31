/**
 * Enum representing different video quality levels
 */
export enum VideoQuality {
    /**
     * Low quality - 360p
     */
    LOW = 'low',

    /**
     * Medium quality - 720p
     */
    MEDIUM = 'medium',

    /**
     * High quality - 1080p
     */
    HIGH = 'high'
}

/**
 * Interface defining video quality settings
 */
export interface QualitySettings {
    /**
     * Selected quality level
     */
    quality: VideoQuality;

    /**
     * Video resolution settings
     */
    resolution: {
        /**
         * Video width in pixels
         */
        width: number;

        /**
         * Video height in pixels
         */
        height: number;
    };

    /**
     * Optional video bitrate in bits per second
     */
    bitrate?: number;

    /**
     * Optional video frame rate in frames per second
     */
    frameRate?: number;
}
