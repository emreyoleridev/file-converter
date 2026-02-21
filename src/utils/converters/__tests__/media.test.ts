import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertMedia } from '../media';

// Mock the ffmpeg package deeply
vi.mock('@ffmpeg/ffmpeg', () => {
    let handlers: any = {};
    return {
        FFmpeg: class {
            load = vi.fn().mockResolvedValue(true);
            on = vi.fn().mockImplementation((event, handler) => { handlers[event] = handler; });
            writeFile = vi.fn().mockResolvedValue(true);
            exec = vi.fn().mockImplementation(async () => {
                if (handlers['progress']) handlers['progress']({ progress: 1, time: 100 });
            });
            readFile = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
            deleteFile = vi.fn().mockResolvedValue(true);
        }
    };
});

vi.mock('@ffmpeg/util', () => ({
    fetchFile: vi.fn().mockResolvedValue(new Uint8Array([0]))
}));

describe('Media Converter', () => {
    it('initializes ffmpeg and converts media', async () => {
        const dummyFile = new File(['mock'], 'video.mp4', { type: 'video/mp4' });

        let progressVal = 0;
        const resultBlob = await convertMedia(dummyFile, 'webm', (p) => {
            progressVal = p;
        });

        expect(resultBlob).toBeInstanceOf(Blob);
        expect(resultBlob.type).toBe('video/webm');
        expect(resultBlob.size).toBe(3); // from mock [1, 2, 3]
        expect(progressVal).toBe(100);
    });

    it('sets specific arguments for gif conversion', async () => {
        const dummyFile = new File(['mock'], 'video.mp4', { type: 'video/mp4' });
        const resultBlob = await convertMedia(dummyFile, 'gif');
        expect(resultBlob.type).toBe('video/gif');
    });
});
