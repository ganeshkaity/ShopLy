import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase storage bucket names
export const PRODUCT_IMAGES_BUCKET = 'products';
export const DIGITAL_FILES_BUCKET = 'digital-files';

/**
 * Upload a file to Supabase storage and return the public URL.
 */
export async function uploadFile(
    bucket: string,
    filePath: string,
    file: File
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Delete a file from Supabase storage.
 */
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Generate a unique file path for uploads.
 */
export function generateFilePath(folder: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${timestamp}_${sanitized}`;
}
