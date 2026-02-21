import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertImage } from '../image';

describe('Image Converter', () => {
    beforeEach(() => {
        // Mock URL.createObjectURL
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();

        // Mock Image
        global.Image = class {
            onload: () => void;
            onerror: () => void;
            width = 100;
            height = 100;
            src = '';
            constructor() {
                this.onload = () => { };
                this.onerror = () => { };
                setTimeout(() => this.onload(), 10); // Auto load
            }
        } as any;

        const fakeContext = {
            fillStyle: '',
            fillRect: vi.fn(),
            drawImage: vi.fn(),
        };

        const canvasProxy = new Proxy({} as HTMLCanvasElement, {
            get(target: any, prop) {
                if (prop === 'getContext') return () => fakeContext;
                if (prop === 'toDataURL') return () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA';
                if (prop === 'toBlob') return (cb: any) => cb(new Blob(['mock-binary-data'], { type: 'image/jpeg' }));
                if (prop === 'width') return 100;
                if (prop === 'height') return 100;
                return Reflect.get(target, prop);
            }
        });

        global.document = {
            createElement: vi.fn((tagName: string) => {
                if (tagName === 'canvas') return canvasProxy;
                return {};
            }) as any
        } as any;
    });

    it('converts file to jpg via canvas', async () => {
        const dummyFile = new File(['mock'], 'test.png', { type: 'image/png' });
        const resultBlob = await convertImage(dummyFile, 'jpg');
        expect(resultBlob).toBeInstanceOf(Blob);
        expect(resultBlob.type).toBe('image/jpeg'); // Assuming mock returns this
        expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('handles svg conversion (wrapper approach)', async () => {
        const dummyFile = new File(['mock'], 'test.png', { type: 'image/png' });
        const resultBlob = await convertImage(dummyFile, 'svg');
        expect(resultBlob.type).toBe('image/svg+xml');
        const text = await resultBlob.text();
        expect(text).toContain('<svg');
        expect(text).toContain('href="data:image/png');
    });
});
