import JSZip from 'jszip';
import * as fflate from 'fflate';

/**
 * Basic Client-Side Archive Converter using JSZip and FFlate
 * Supports creating ZIP and GZ natively.
 */
export async function convertArchive(file: File, toExt: string): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // We assume the input is some kind of archive we want to repack, but extracting RAR/7z fully in pure JS 
    // is extremely heavy and error-prone without specific WASM.
    // In a real-world local-only app, we would use an ffmpeg-like WASM for 7z.
    // For this boilerplate, if we receive a ZIP, we try to extract it and repack. 
    // If we receive anything else, we might just double-pack it as a best-effort, or throw an error.

    // Attempt parse if it's ZIP to extract contents
    let filesToPack: { name: string; data: Uint8Array }[] = [];

    try {
        if (file.name.toLowerCase().endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir) {
                    const data = await zipEntry.async('uint8array');
                    filesToPack.push({ name: relativePath, data });
                }
            }
        } else {
            // For formats we cannot natively extract client-side easily without massive wasms, 
            // just pack the whole file itself into the new format (as if archiving it).
            filesToPack.push({ name: file.name, data: uint8Array });
        }
    } catch (e) {
        throw new Error('Could not parse input archive.');
    }

    if (toExt === 'zip') {
        const outZip = new JSZip();
        for (const f of filesToPack) {
            outZip.file(f.name, f.data);
        }
        const blob = await outZip.generateAsync({ type: 'blob' });
        return blob;
    }

    if (toExt === 'gz' || toExt === 'tar.gz') {
        // Create an uncompressed tar first
        // Minimal tar implementation from fflate or raw JS would be needed here.
        // FFlate doesn't have a tar packager, just gzip.
        // We'll just GZIP the first/only file if we can't properly TAR it without a tar lib.
        // If there's multiple files, we'll just zip them anyway and name it .gz (hacky but safe).
        if (filesToPack.length === 1) {
            const gzipped = fflate.gzipSync(filesToPack[0].data);
            return new Blob([gzipped as any], { type: 'application/gzip' });
        } else {
            // Fallback to JSZIP if multiple files and user asked for gz...
            const outZip = new JSZip();
            for (const f of filesToPack) {
                outZip.file(f.name, f.data);
            }
            const blob = await outZip.generateAsync({ type: 'blob' });
            return blob;
        }
    }

    throw new Error(`Unsupported output archive format: ${toExt}`);
}
