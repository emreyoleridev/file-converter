# Universal File Converter

A powerful, 100% secure, and locally-processed Advanced File Converter built with Next.js 14, Tailwind CSS, and Shadcn UI. No backend dependencies, no uploaded files—everything happens directly in your browser.

Built by [Emre Yoleri](https://github.com/emreyoleridev)

## Features & Supported Formats

This application supports 10 distinct categories, processed as efficiently as possible in the browser context:

1. **Document**: PDF, DOCX, TXT, CSV, HTML, MD conversions (Best-effort Text/PDF extraction).
2. **Image**: JPG, PNG, WEBP, GIF, BMP, TIFF, SVG, ICO to JPG, PNG, WEBP, SVG, PDF. (Powered by Canvas & PDF-lib)
3. **Video**: MP4, MOV, MKV, AVI, WEBM, M4V, FLV, WMV, 3GP to MP4, WEBM, MOV, AVI, MKV, GIF, MP3. (Powered by FFmpeg.wasm)
4. **Audio**: MP3, WAV, AAC, M4A, FLAC, OGG, OPUS, WMA to MP3, WAV, M4A, FLAC, OGG, OPUS, AAC. (Powered by FFmpeg.wasm)
5. **Archive**: ZIP, TAR, GZ repacking and creation. (Powered by JSZip & FFlate)
6. **Developer**: JSON, XML, YAML, CSV, SQL, Base64 interchangeable converters.
7. **Subtitle**: SRT, VTT, TXT conversions.
8. **eBook / Font / CAD3D**: Built into the UI scaffolding (Requires backend handler extensions for full binary translations).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4, Framer Motion
- **UI Components**: Shadcn UI (Radix Primitives)
- **Core Processing**:
  - `ffmpeg.wasm` for Media
  - `pdf-lib` for Documents/Images
  - `jszip` & `fflate` for Archives
  - `papaparse` & `yaml` for Developer formats

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security Notice

Because this app utilizes `ffmpeg.wasm`, it relies heavily on local WebAssembly execution. All your files remain on your device and are **never** uploaded to a server.

## License
MIT
