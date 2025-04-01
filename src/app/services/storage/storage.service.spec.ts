import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { SavedVideo } from '../../models/video.model';
import { VideoQuality } from '../../models/quality.model';

describe('StorageService', () => {
  let service: StorageService;
  let indexedDB: IDBFactory;
  let mockDB: any;

  const mockVideo: SavedVideo = {
    id: '1',
    blobData: new ArrayBuffer(8),
    timestamp: Date.now(),
    duration: 5,
    quality: VideoQuality.HIGH
  };

  beforeEach(() => {
    indexedDB = window.indexedDB;

    mockDB = {
      objectStoreNames: {
        contains: jasmine.createSpy('contains').and.returnValue(true)
      },
      createObjectStore: jasmine.createSpy('createObjectStore'),
      transaction: jasmine.createSpy('transaction').and.returnValue({
        objectStore: () => ({
          add: jasmine.createSpy('add').and.returnValue({
            onsuccess: null,
            onerror: null
          }),
          put: jasmine.createSpy('put').and.returnValue({
            onsuccess: null,
            onerror: null
          }),
          delete: jasmine.createSpy('delete').and.returnValue({
            onsuccess: null,
            onerror: null
          }),
          getAll: jasmine.createSpy('getAll').and.returnValue({
            onsuccess: null,
            onerror: null
          })
        })
      })
    };

    (window as any).indexedDB = {
      open: jasmine.createSpy('open').and.returnValue({
        result: null,
        error: null,
        onerror: null,
        onsuccess: function(this: any) {
          this.result = mockDB;
          if (this.onsuccess) this.onsuccess(new Event('success'));
        },
        onupgradeneeded: null
      })
    };

    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    window.indexedDB = indexedDB;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize IndexedDB on creation', (done) => {
      service['initDB']().then(() => {
        expect(window.indexedDB.open).toHaveBeenCalledWith(
          'BandwidthCheckerDB',
          jasmine.any(Number)
        );
        done();
      });
    });

    it('should create object store if not exists', () => {
      const openRequest = window.indexedDB.open('BandwidthCheckerDB', 1);
      mockDB.objectStoreNames.contains.and.returnValue(false);

      const upgradeEvent = new Event('upgradeneeded') as IDBVersionChangeEvent;
      Object.defineProperty(upgradeEvent, 'newVersion', { value: 1 });
      Object.defineProperty(upgradeEvent, 'oldVersion', { value: 0 });
      openRequest.onupgradeneeded && openRequest.onupgradeneeded(upgradeEvent);

      expect(mockDB.createObjectStore).toHaveBeenCalledWith('videos', { keyPath: 'id' });
    });
  });

  describe('video operations', () => {
    beforeEach((done) => {
      service['initDB']().then(done);
    });

    it('should save video', async () => {
      const savePromise = service.saveVideo(mockVideo);

      const request = mockDB.transaction().objectStore().add();
      request.onsuccess && request.onsuccess(new Event('success'));

      await expectAsync(savePromise).toBeResolved();
    });

    it('should handle save error', async () => {
      const savePromise = service.saveVideo(mockVideo);

      const request = mockDB.transaction().objectStore().add();
      const errorEvent = new Event('error') as any;
      errorEvent.target = { error: new Error('Save failed') };
      request.onerror && request.onerror(errorEvent);

      await expectAsync(savePromise).toBeRejected();
    });

    it('should get all videos', async () => {
      const getAllPromise = service.getAllVideos();

      const request = mockDB.transaction().objectStore().getAll();
      const successEvent = new Event('success') as any;
      successEvent.target = { result: [mockVideo] };
      request.onsuccess && request.onsuccess(successEvent);

      const videos = await getAllPromise;
      expect(videos).toEqual([mockVideo]);
    });

    it('should delete video', async () => {
      const deletePromise = service.deleteVideo(mockVideo.id);

      const request = mockDB.transaction().objectStore().delete();
      request.onsuccess && request.onsuccess(new Event('success'));

      await expectAsync(deletePromise).toBeResolved();
    });

    it('should handle delete error', async () => {
      const deletePromise = service.deleteVideo(mockVideo.id);

      const request = mockDB.transaction().objectStore().delete();
      const errorEvent = new Event('error') as any;
      errorEvent.target = { error: new Error('Delete failed') };
      request.onerror && request.onerror(errorEvent);

      await expectAsync(deletePromise).toBeRejected();
    });
  });

  describe('error handling', () => {
    it('should handle database initialization error', async () => {
      const openRequest = window.indexedDB.open('BandwidthCheckerDB', 1);
      const errorEvent = new Event('error') as any;
      errorEvent.target = { error: new Error('Init failed') };
      openRequest.onerror && openRequest.onerror(errorEvent);

      await expectAsync(service['initDB']()).toBeRejected();
    });

    it('should handle transaction error', async () => {
      mockDB.transaction.and.throwError('Transaction failed');

      await expectAsync(service.getAllVideos()).toBeRejected();
    });
  });
});
