import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg(): Promise<FFmpeg> {
    if (ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg();

    // We rely on unpkg/cdnjs for the core if not hosted locally in public
    // Alternatively, we can just load the defaults if the bundler resolves it.
    // For Next.js, default load might throw without proper CORS headers, 
    // so we'll do a basic load and catch errors in the UI if SharedArrayBuffer is missing.
    try {
        await ffmpeg.load({
            // Using default CDNs if available in @ffmpeg/core
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
        });
    } catch (e) {
        console.error("FFmpeg load failed. Ensure Cross-Origin-Embedder-Policy is require-corp", e);
        throw new Error("FFmpeg could not be loaded. Browser missing SharedArrayBuffer support.");
    }
    return ffmpeg;
}

export async function convertMedia(file: File, toExt: string, onProgress?: (p: number) => void): Promise<Blob> {
    const ff = await getFFmpeg();

    ff.on('progress', ({ progress, time }) => {
        if (onProgress) onProgress(progress * 100);
    });

    const inputName = `input.${file.name.split('.').pop()}`;
    const outputName = `output.${toExt}`;

    await ff.writeFile(inputName, await fetchFile(file));

    // Basic ffmpeg command, just copying streams if possible or re-encoding
    // -c:v copy usually works for similar containers but to be safe and format agnostic, we let ffmpeg transcode
    const args = ['-i', inputName];

    // Some specific format tuning
    if (toExt === 'gif') {
        args.push('-vf', 'fps=10,scale=320:-1:flags=lanczos:ext_color=1');
    }

    args.push(outputName);

    try {
        await ff.exec(args);
        const data = await ff.readFile(outputName);
        return new Blob([data as any], { type: `video/${toExt}` }); // Generic MIME type fallback
    } catch (e: any) {
        throw new Error(`Media conversion failed: ${e.message}`);
    } finally {
        try {
            await ff.deleteFile(inputName);
            await ff.deleteFile(outputName);
        } catch (e) { }
    }
}
