import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(seconds: number): string {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return '0s';
    }

    // Round to whole seconds
    seconds = Math.round(seconds);

    // If less than 60 seconds, show only seconds with 's' suffix
    if (seconds < 60) {
      return `${seconds}s`;
    }

    // For time longer than a minute format as M:SS
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
