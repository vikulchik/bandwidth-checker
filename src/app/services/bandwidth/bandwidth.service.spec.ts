import { TestBed } from '@angular/core/testing';
import { BandwidthService } from './bandwidth.service';
import { Store } from '@ngxs/store';
import { VideoQuality } from '../../models/quality.model';
import { SetVideoQuality } from '../../store/video.actions';

describe('BandwidthService', () => {
  let service: BandwidthService;
  let store: jasmine.SpyObj<Store>;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        BandwidthService,
        { provide: Store, useValue: storeSpy }
      ]
    });

    service = TestBed.inject(BandwidthService);
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    fetchSpy = spyOn(window, 'fetch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRecommendedQuality', () => {
    it('should return LOW quality for bandwidth < 2 Mbps', () => {
      const quality = service.getRecommendedQuality(1.5);
      expect(quality).toBe(VideoQuality.LOW);
    });

    it('should return MEDIUM quality for bandwidth between 2 and 5 Mbps', () => {
      const quality = service.getRecommendedQuality(3.5);
      expect(quality).toBe(VideoQuality.MEDIUM);
    });

    it('should return HIGH quality for bandwidth > 5 Mbps', () => {
      const quality = service.getRecommendedQuality(6);
      expect(quality).toBe(VideoQuality.HIGH);
    });

    it('should return MEDIUM quality for edge case at 2 Mbps', () => {
      const quality = service.getRecommendedQuality(2);
      expect(quality).toBe(VideoQuality.MEDIUM);
    });

    it('should return MEDIUM quality for edge case at 5 Mbps', () => {
      const quality = service.getRecommendedQuality(5);
      expect(quality).toBe(VideoQuality.HIGH);
    });

    it('should return LOW quality for bandwidth < 1 Mbps', () => {
      expect(service.getRecommendedQuality(500000)).toBe(VideoQuality.LOW);
    });

    it('should return MEDIUM quality for bandwidth between 1-5 Mbps', () => {
      expect(service.getRecommendedQuality(3000000)).toBe(VideoQuality.MEDIUM);
    });

    it('should return HIGH quality for bandwidth > 5 Mbps', () => {
      expect(service.getRecommendedQuality(6000000)).toBe(VideoQuality.HIGH);
    });
  });

  describe('measureBandwidth', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should measure bandwidth successfully', async () => {
      const bandwidth = await service.measureBandwidth();
      expect(bandwidth).toBeGreaterThan(0);
    });

    it('should throw error for failed measurement', async () => {
      // Mock fetch to simulate failure
      spyOn(window, 'fetch').and.returnValue(Promise.reject('Network error'));

      await expectAsync(service.measureBandwidth()).toBeRejected();
    });

    it('should calculate bandwidth correctly based on file size and download time', async () => {
      const mockResponse = new Response(new ArrayBuffer(1000000)); // 1MB file
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

      // Mock performance.now() to simulate 1 second download time
      const originalNow = performance.now;
      let callCount = 0;
      spyOn(performance, 'now').and.callFake(() => {
        callCount++;
        return callCount === 1 ? 0 : 1000; // Return 0 first time, 1000 second time
      });

      const bandwidth = await service.measureBandwidth();
      expect(bandwidth).toBe(8); // 1MB in 1 second = 8 Mbps

      // Restore original performance.now
      performance.now = originalNow;
    });

    it('should measure bandwidth and set appropriate quality', async () => {
      const mockResponse = new Response(new ArrayBuffer(1000000));
      Object.defineProperty(mockResponse, 'ok', { value: true });
      fetchSpy.and.returnValue(Promise.resolve(mockResponse));

      const startTime = Date.now();
      jasmine.clock().mockDate(new Date(startTime));

      const measurePromise = service.measureBandwidth();

      // Simulate time passing (1 second)
      jasmine.clock().tick(1000);

      await measurePromise;

      expect(store.dispatch).toHaveBeenCalledWith(jasmine.any(SetVideoQuality));
    });

    it('should handle fetch error', async () => {
      fetchSpy.and.returnValue(Promise.reject(new Error('Network error')));

      await service.measureBandwidth();

      expect(store.dispatch).toHaveBeenCalledWith(new SetVideoQuality(VideoQuality.LOW));
    });

    it('should handle non-ok response', async () => {
      const mockResponse = new Response(null, { status: 404 });
      fetchSpy.and.returnValue(Promise.resolve(mockResponse));

      await service.measureBandwidth();

      expect(store.dispatch).toHaveBeenCalledWith(new SetVideoQuality(VideoQuality.LOW));
    });
  });
});
