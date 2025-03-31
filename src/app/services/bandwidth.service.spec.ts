import { TestBed } from '@angular/core/testing';
import { BandwidthService } from './bandwidth.service';
import { Store } from '@ngxs/store';
import { VideoQuality } from '../models/quality.model';
import { SetVideoQuality } from '../store/video.actions';

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

  describe('getRecommendedQuality', () => {
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
