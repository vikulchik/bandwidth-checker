import { Injectable } from '@angular/core';
import { VideoQuality } from '../../models/quality.model';

@Injectable({
  providedIn: 'root'
})
export class BandwidthService {
  private readonly TEST_FILE_URL = 'assets/test-files/test-video.mp4';
  private readonly SAMPLE_SIZE = 2 * 1024 * 1024; // 2MB for test
  private readonly LOW_THRESHOLD = 2; // 2 Mbps
  private readonly HIGH_THRESHOLD = 5; // 5 Mbps
  private readonly TIMEOUT = 10000; // 10 seconds timeout

  async measureBandwidth(): Promise<number> {
    const startTime = performance.now();

    try {
      // First check if the file is accessible
      const headResponse = await fetch(this.TEST_FILE_URL, { method: 'HEAD' });
      if (!headResponse.ok) {
        throw new Error('Test file is not accessible');
      }

      // Load only a part of the file
      const response = await fetch(this.TEST_FILE_URL, {
        headers: {
          Range: `bytes=0-${this.SAMPLE_SIZE - 1}`
        },
        signal: AbortSignal.timeout(this.TIMEOUT)
      });

      // If server doesn't support Range requests, use regular request
      if (!response.ok && response.status !== 206) {
        console.warn('Server does not support range requests, falling back to full file download');
        const fullResponse = await fetch(this.TEST_FILE_URL, {
          signal: AbortSignal.timeout(this.TIMEOUT)
        });
        if (!fullResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await fullResponse.blob();
        const endTime = performance.now();
        const durationInSeconds = (endTime - startTime) / 1000;
        const bitsLoaded = Math.min(data.size, this.SAMPLE_SIZE) * 8;
        return (bitsLoaded / durationInSeconds) / (1024 * 1024);
      }

      const data = await response.blob();
      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const bitsLoaded = data.size * 8;

      // Calculate the speed in Mbps
      const speedInMbps = (bitsLoaded / durationInSeconds) / (1024 * 1024);
      console.log(`Measured bandwidth: ${speedInMbps.toFixed(2)} Mbps`);
      console.log(`Download size: ${(data.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Download time: ${durationInSeconds.toFixed(2)} seconds`);

      return speedInMbps;
    } catch (error) {
      if (error instanceof Error) {
        if ('name' in error && error.name === 'TimeoutError') {
          console.error('Bandwidth measurement timed out');
          // In case of timeout, return low speed
          return this.LOW_THRESHOLD - 0.1;
        }
        console.error('Error measuring bandwidth:', error.message);
      }
      throw error;
    }
  }

  getRecommendedQuality(bandwidth: number): VideoQuality {
    if (bandwidth < this.LOW_THRESHOLD) {
      return VideoQuality.LOW;
    } else if (bandwidth < this.HIGH_THRESHOLD) {
      return VideoQuality.MEDIUM;
    } else {
      return VideoQuality.HIGH;
    }
  }
}
