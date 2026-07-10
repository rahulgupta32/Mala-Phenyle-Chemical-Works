import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

export interface StorageService {
  uploadFile(file: File, folder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'public', 'uploads');
  }

  private async ensureDirectory(dirPath: string) {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  async uploadFile(file: File, folder = 'products'): Promise<string> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const targetFolder = join(this.uploadDir, folder);
      await this.ensureDirectory(targetFolder);

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${uniqueSuffix}.${fileExtension}`;
      
      const filePath = join(targetFolder, fileName);
      await writeFile(filePath, buffer);

      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      console.error('Local file upload failed:', error);
      throw new Error('Failed to upload file locally');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl.startsWith('/uploads/')) return;

      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = join(this.uploadDir, relativePath);

      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error('Local file delete failed:', error);
    }
  }
}

class CloudinaryStorageService implements StorageService {
  private localService = new LocalStorageService();

  async uploadFile(file: File, folder = 'products'): Promise<string> {
    // 1. Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('Unsupported file type. Only JPEG, PNG, WEBP, and GIF are allowed.');
    }

    // 2. Validate file size (10MB limit)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('File size exceeds maximum limit of 10MB.');
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Fall back to local storage if Cloudinary config is missing
    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary environment variables missing. Falling back to local storage.');
      return this.localService.uploadFile(file, folder);
    }

    try {
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
      const publicId = `mala_${uniqueSuffix}`;

      // Sign the request
      const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha256').update(paramsToSign).digest('hex');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('public_id', publicId);
      formData.append('folder', folder);
      formData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudinary upload failed: ${errText}`);
      }

      const data = await res.json();
      return data.secure_url;
    } catch (error: any) {
      console.error('Cloudinary upload failed, attempting local fallback:', error);
      return this.localService.uploadFile(file, folder);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (fileUrl.startsWith('/uploads/')) {
      return this.localService.deleteFile(fileUrl);
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) return;

    try {
      // Extract public ID from Cloudinary URL
      const parts = fileUrl.split('/image/upload/');
      if (parts.length < 2) return;

      const pathAndId = parts[1].split('/').slice(1).join('/'); // Removes v[version] prefix
      const publicId = pathAndId.split('.')[0]; // Removes file extension

      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha256').update(paramsToSign).digest('hex');

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Cloudinary file delete failed:', error);
    }
  }
}

export const storageService: StorageService = new CloudinaryStorageService();
