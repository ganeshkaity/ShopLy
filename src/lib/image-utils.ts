/**
 * Compresses an image file to WebP format and tries to keep it under a target size.
 */
export async function compressImage(
    file: File,
    {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        targetSizeKB = 100
    } = {}
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Start with initial quality and adjust if file is too large
                const attemptCompression = (q: number) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Canvas toBlob failed"));
                                return;
                            }

                            const sizeKB = blob.size / 1024;

                            // If still too large and we can reduce quality further
                            if (sizeKB > targetSizeKB && q > 0.1) {
                                attemptCompression(q - 0.1);
                            } else {
                                resolve(blob);
                            }
                        },
                        'image/webp',
                        q
                    );
                };

                attemptCompression(quality);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
    });
}
