import multer from 'multer';
import { s3Client } from '../config/aws.js';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * AWS S3 storage service for production
 */
class S3StorageService {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  /**
   * Get multer storage configuration for S3
   */
  getMulterStorage() {
    return {
      _handleFile: (req, file, cb) => {
        this.uploadToS3(req, file, cb);
      },
      _removeFile: (req, file, cb) => {
        this.deleteFromS3(file.key, cb);
      }
    };
  }

  /**
   * Upload file to S3
   */
  async uploadToS3(req, file, cb) {
    try {
      const key = `resources/${Date.now()}-${Math.round(Math.random() * 1E9)}${this.getFileExtension(file.originalname)}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.stream,
        ContentType: file.mimetype,
        Metadata: {
          originalname: file.originalname,
          uploadedBy: req.user?.id || 'unknown'
        }
      });

      await s3Client.send(command);

      // Store file info for multer
      file.key = key;
      file.location = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      
      cb(null, {
        key,
        location: file.location,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    } catch (error) {
      cb(error);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFromS3(key, cb) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await s3Client.send(command);
      cb(null);
    } catch (error) {
      cb(error);
    }
  }

  /**
   * Get pre-signed download URL from S3
   */
  async getDownloadUrl(key, originalName) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${originalName}"`
      });

      const signedUrl = await getSignedUrl(s3Client, command, { 
        expiresIn: 3600 // 1 hour
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating S3 signed URL:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting S3 file:', error);
      throw error;
    }
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }
}

export default S3StorageService;