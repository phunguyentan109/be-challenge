import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import { HttpStatus } from '../constants/httpStatus';
import { HttpError } from '../utils/httpError';

export class CloudinaryService {
  uploadFile(file: Express.Multer.File, resourceType: 'image' | 'video'): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, 'Cloudinary is not configured');
    }

    const options: UploadApiOptions = {
      folder: 'movies',
      resource_type: resourceType,
    };

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(new HttpError(HttpStatus.BAD_GATEWAY, 'Failed to upload file to Cloudinary'));
          return;
        }

        resolve(result.secure_url);
      });

      stream.end(file.buffer);
    });
  }
}
