import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
    let pipe: DurationPipe;

    beforeEach(() => {
        pipe = new DurationPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return "0s" for invalid input', () => {
        expect(pipe.transform(0)).toBe('0s');
        expect(pipe.transform(undefined as unknown as number)).toBe('0s');
        expect(pipe.transform(NaN)).toBe('0s');
        expect(pipe.transform(Infinity)).toBe('0s');
    });

    it('should format seconds less than 60', () => {
        expect(pipe.transform(45)).toBe('45s');
        expect(pipe.transform(5)).toBe('5s');
        expect(pipe.transform(0)).toBe('0s');
    });

    it('should format minutes and seconds', () => {
        expect(pipe.transform(65)).toBe('1:05');
        expect(pipe.transform(120)).toBe('2:00');
        expect(pipe.transform(599)).toBe('9:59');
    });

    it('should round seconds to nearest integer', () => {
        expect(pipe.transform(45.4)).toBe('45s');
        expect(pipe.transform(45.6)).toBe('46s');
        expect(pipe.transform(59.9)).toBe('60s');
    });
}); 