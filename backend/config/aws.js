import { S3Client } from '@aws-sdk/client-s3';

/**
 * AWS S3 configuration
 * Supports both local development and production environments
 */
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// For local development, use local endpoint if provided
if (process.env.NODE_ENV === 'development' && process.env.AWS_ENDPOINT) {
  s3Config.endpoint = process.env.AWS_ENDPOINT;
  s3Config.forcePathStyle = true;
}

const s3Client = new S3Client(s3Config);

export { s3Client };