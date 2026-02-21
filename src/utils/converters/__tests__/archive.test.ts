import { describe, it, expect } from 'vitest';
import { convertArchive } from '../archive';

describe('Archive Converter', () => {
    it('creates a zip from a regular file', async () => {
        const fileContent = 'hello world archive test';
        const dummyFile = new File([fileContent], 'dummy.txt', { type: 'text/plain' });

        const resultBlob = await convertArchive(dummyFile, 'zip');
        expect(resultBlob.type).toBe('application/zip');
        expect(resultBlob.size).toBeGreaterThan(0);
    });

    it('creates a gz from a regular file', async () => {
        const dummyFile = new File(['compress me'], 'test.txt', { type: 'text/plain' });

        const resultBlob = await convertArchive(dummyFile, 'gz');
        expect(resultBlob.type).toBe('application/gzip');
        expect(resultBlob.size).toBeGreaterThan(0);
    });
});
