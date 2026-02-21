import { PDFDocument } from 'pdf-lib';

/**
 * Converts Image to Image, or Image to PDF
 */
export async function convertImage(file: File, toExt: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);

        if (toExt === 'pdf') {
            // Convert Image to PDF
            const img = new Image();
            img.onload = async () => {
                try {
                    const pdfDoc = await PDFDocument.create();
                    const page = pdfDoc.addPage([img.width, img.height]);

                    const imageBytes = await file.arrayBuffer();
                    let pdfImage;

                    // pdf-lib supports JPG and PNG natively
                    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
                        pdfImage = await pdfDoc.embedJpg(imageBytes);
                    } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
                        pdfImage = await pdfDoc.embedPng(imageBytes);
                    } else {
                        // For other formats (webp, bmp), we need to draw it to canvas and export as PNG first
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0);
                        const pngDataUrl = canvas.toDataURL('image/png');
                        const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
                        pdfImage = await pdfDoc.embedPng(pngBytes);
                    }

                    page.drawImage(pdfImage, {
                        x: 0,
                        y: 0,
                        width: img.width,
                        height: img.height,
                    });

                    const pdfBytes = await pdfDoc.save();
                    URL.revokeObjectURL(url);
                    resolve(new Blob([pdfBytes as any], { type: 'application/pdf' }));
                } catch (e: any) {
                    reject(new Error(`Failed to create PDF from image: ${e.message}`));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image for PDF conversion'));
            img.src = url;
            return;
        }

        // Generic Image to Image Conversion via Canvas
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Fill background with white in case of transparent to JPG
            if (toExt === 'jpg' || toExt === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            let mimeType = `image/${toExt === 'jpg' ? 'jpeg' : toExt}`;
            if (toExt === 'svg') mimeType = 'image/svg+xml';

            // SVG requires a totally different approach (vectorization), doing a wrapper here as best-effort for client side without heavy WASM
            if (toExt === 'svg') {
                const dataUrl = canvas.toDataURL('image/png');
                const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}"><image href="${dataUrl}" width="${img.width}" height="${img.height}"/></svg>`;
                URL.revokeObjectURL(url);
                resolve(new Blob([svgString], { type: 'image/svg+xml' }));
                return;
            }

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create image blob. Format may not be supported by browser.'));
                }
            }, mimeType, 0.95); // 0.95 quality for jpeg/webp
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for conversion.'));
        };
        img.src = url;
    });
}
