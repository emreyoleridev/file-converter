export const CATEGORIES = [
    { id: 'document', name: 'Document', icon: 'FileText' },
    { id: 'image', name: 'Image', icon: 'Image' },
    { id: 'video', name: 'Video', icon: 'Video' },
    { id: 'audio', name: 'Audio', icon: 'Music' },
    { id: 'archive', name: 'Archive', icon: 'Archive' },
    { id: 'ebook', name: 'eBook', icon: 'Book' },
    { id: 'font', name: 'Font', icon: 'Type' },
    { id: 'cad3d', name: 'CAD / 3D', icon: 'Box' },
    { id: 'developer', name: 'Developer', icon: 'Code' },
    { id: 'subtitle', name: 'Subtitle', icon: 'MessageSquare' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export const FORMATS: Record<CategoryId, { in: string[], out: string[] }> = {
    document: {
        in: ['pdf', 'doc', 'docx', 'rtf', 'txt', 'odt', 'ods', 'odp', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'html', 'xml', 'md'],
        out: ['pdf', 'docx', 'txt', 'rtf', 'odt', 'html', 'pptx', 'xlsx', 'csv']
    },
    image: {
        in: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'heic', 'heif', 'svg', 'ico', 'psd', 'raw', 'cr2', 'nef', 'arw'],
        out: ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'pdf', 'ico']
    },
    video: {
        in: ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'flv', 'wmv', '3gp', 'mpeg'],
        out: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif', 'mp3']
    },
    audio: {
        in: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus', 'wma', 'aiff', 'amr'],
        out: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'opus', 'aac']
    },
    archive: {
        in: ['zip', 'rar', '7z', 'tar', 'tar.gz', 'gz', 'bz2', 'iso'],
        out: ['zip', '7z', 'tar', 'tar.gz']
    },
    ebook: {
        in: ['epub', 'mobi', 'azw', 'azw3', 'fb2', 'pdf'],
        out: ['epub', 'mobi', 'pdf', 'txt']
    },
    font: {
        in: ['ttf', 'otf', 'woff', 'woff2', 'eot'],
        out: ['ttf', 'otf', 'woff', 'woff2']
    },
    cad3d: {
        in: ['dwg', 'dxf', 'stl', 'obj', 'fbx', 'step', 'iges'],
        out: ['stl', 'obj', 'fbx', 'pdf']
    },
    developer: {
        in: ['json', 'xml', 'yaml', 'csv', 'sql', 'md', 'base64'],
        out: ['json', 'xml', 'yaml', 'csv', 'txt', 'sql']
    },
    subtitle: {
        in: ['srt', 'vtt', 'ass', 'sub'],
        out: ['srt', 'vtt', 'txt']
    }
};
