/**
 * Converts Subtitles (SRT <-> VTT <-> TXT)
 */

function srtToVtt(srt: string): string {
    let vtt = "WEBVTT\n\n";
    // Replace commas in timestamps with dots (00:00:01,000 -> 00:00:01.000)
    vtt += srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
    return vtt;
}

function vttToSrt(vtt: string): string {
    let srt = vtt;
    // Remove WEBVTT header
    srt = srt.replace(/^WEBVTT.*\n\n/i, "");
    // Replace dots in timestamps with commas
    srt = srt.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2");
    return srt;
}

function toTxt(sub: string): string {
    // Remove all timestamps and numbering
    let txt = sub.replace(/^WEBVTT.*\n\n/i, "");
    txt = txt.replace(/\d+\r?\n\d{2}:\d{2}:\d{2}[.,]\d{3} --> \d{2}:\d{2}:\d{2}[.,]\d{3}.*\r?\n/g, "");
    return txt.replace(/\n{2,}/g, "\n").trim();
}

export function convertSubtitle(fileContent: string, fromExt: string, toExt: string): string {
    let intermediateSrt = fileContent;

    // Convert everything to SRT as a base if it's VTT
    if (fromExt === 'vtt') {
        intermediateSrt = vttToSrt(fileContent);
    }
    // Minimal sub/ass support: just treat as text to extract or pass through for now

    switch (toExt) {
        case 'srt':
            return intermediateSrt;
        case 'vtt':
            return srtToVtt(intermediateSrt);
        case 'txt':
            return toTxt(intermediateSrt);
        default:
            return intermediateSrt;
    }
}
