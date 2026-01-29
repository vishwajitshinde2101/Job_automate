/**
 * ======================== S3 UPLOAD UTILITY ========================
 * Handles file uploads to AWS S3 bucket
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'autojobzy-resumes';

/**
 * Upload file to S3 bucket
 * @param {string} filePath - Local file path
 * @param {string} fileName - Desired file name in S3
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - S3 file URL
 */
export const uploadToS3 = async (filePath, fileName, mimeType) => {
    try {
        // Read file from local storage
        const fileContent = fs.readFileSync(filePath);

        // Prepare S3 key (folder structure: resumes/userId-timestamp-filename.pdf)
        const s3Key = `resumes/${fileName}`;

        // Upload parameters
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: mimeType,
            // Make file publicly accessible (optional - remove if you want private files)
            // ACL: 'public-read',
        };

        // Upload to S3 using multipart upload for large files
        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        upload.on('httpUploadProgress', (progress) => {
            console.log(`Upload progress: ${progress.loaded}/${progress.total} bytes`);
        });

        const result = await upload.done();

        // Construct S3 URL
        // Format: https://bucket-name.s3.region.amazonaws.com/resumes/filename.pdf
        const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        console.log('✅ File uploaded to S3:', s3Url);

        // Delete local file after successful upload
        try {
            fs.unlinkSync(filePath);
            console.log('✅ Local file deleted:', filePath);
        } catch (unlinkError) {
            console.warn('⚠️ Could not delete local file:', unlinkError.message);
        }

        return s3Url;
    } catch (error) {
        console.error('❌ S3 Upload Error:', error);
        throw new Error(`S3 upload failed: ${error.message}`);
    }
};

/**
 * Delete file from S3 bucket
 * @param {string} s3Url - Full S3 URL
 * @returns {Promise<boolean>}
 */
export const deleteFromS3 = async (s3Url) => {
    try {
        // Extract key from S3 URL
        // Example: https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/file.pdf
        // Extract: resumes/file.pdf
        const urlParts = s3Url.split('.com/');
        if (urlParts.length < 2) {
            throw new Error('Invalid S3 URL format');
        }
        const s3Key = urlParts[1];

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log('✅ File deleted from S3:', s3Key);
        return true;
    } catch (error) {
        console.error('❌ S3 Delete Error:', error);
        return false;
    }
};

/**
 * Generate pre-signed URL for private files (optional)
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>}
 */
export const getSignedUrl = async (s3Key, expiresIn = 3600) => {
    try {
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('❌ Pre-signed URL Error:', error);
        throw error;
    }
};

export default { uploadToS3, deleteFromS3, getSignedUrl };
