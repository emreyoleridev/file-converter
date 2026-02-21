import { describe, it, expect } from 'vitest';
import { convertSubtitle } from '../subtitle';

describe('Subtitle Converter', () => {
    it('converts SRT to VTT', () => {
        const srt = `1
00:00:01,000 --> 00:00:02,000
Hello World`;
        const vtt = convertSubtitle(srt, 'srt', 'vtt');
        expect(vtt).toContain('WEBVTT');
        expect(vtt).toContain('00:00:01.000 --> 00:00:02.000');
    });

    it('converts VTT to SRT', () => {
        const vtt = `WEBVTT

1
00:00:01.000 --> 00:00:02.000
Hello World`;
        const srt = convertSubtitle(vtt, 'vtt', 'srt');
        expect(srt).not.toContain('WEBVTT');
        expect(srt).toContain('00:00:01,000 --> 00:00:02,000');
    });

    it('extracts plain text from subtitles', () => {
        const srt = `1
00:00:01,000 --> 00:00:02,000
Hello World`;
        const txt = convertSubtitle(srt, 'srt', 'txt');
        expect(txt).not.toContain('00:00:01,000');
        expect(txt).toContain('Hello World');
    });
});
