'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload une image vers Cloudinary
 * @param file - Fichier sous forme de Buffer ou base64
 * @param folder - Dossier de destination (ex: 'ads/products', 'ads/laboratories', 'ads/categories')
 * @param filename - Nom du fichier original
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string,
  filename?: string
): Promise<UploadResult> {
  try {
    // Générer un nom unique
    const publicId = filename 
      ? `${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-')}-${Date.now()}`
      : `image-${Date.now()}`;

    let result: any;

    if (typeof file === 'string' && file.startsWith('data:')) {
      // Upload direct d'une string base64
      result = await cloudinary.uploader.upload(file, {
        folder: folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });
    } else {
      // Upload d'un Buffer
      const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file as string, 'base64');
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Erreur lors de l\'upload de l\'image');
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: { buffer: Buffer | string; filename: string }[],
  folder: string
): Promise<UploadResult[]> {
  const uploads = files.map(file => uploadImage(file.buffer, folder, file.filename));
  return Promise.all(uploads);
}

/**
 * Supprimer une image de Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Erreur lors de la suppression de l\'image');
  }
}

/**
 * Générer une URL optimisée pour une image existante
 * Note: Cette fonction ne fait pas d'appel API, juste génère une URL
 */
export async function getOptimizedImageUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): Promise<string> {
  const { width, height, crop = 'fill' } = options;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality: 'auto',
    fetch_format: 'auto',
  });
}
