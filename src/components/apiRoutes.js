// import express from 'express';
// import multer from 'multer';
// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid'; // Use uuid instead of crypto for random strings


// const router = express.Router();

// // Configure AWS S3 using the newer AWS SDK v3
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });

// const BUCKET_NAME = process.env.AWS_BUCKET;
// const UPLOAD_FOLDER = 'uploads';

// // Configure Multer with file validation
// const fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = [
//     'image/jpeg',
//     'image/png',
//     'image/gif',
//     'image/webp',
//     'image/svg+xml'
//   ];
  
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only JPG, PNG, GIF, WebP and SVG files are allowed.'), false);
//   }
// };

// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// // Function to get content type
// const getContentType = (filename) => {
//   const ext = path.extname(filename).toLowerCase();
//   const contentTypes = {
//     '.jpg': 'image/jpeg',
//     '.jpeg': 'image/jpeg',
//     '.png': 'image/png',
//     '.gif': 'image/gif',
//     '.webp': 'image/webp',
//     '.svg': 'image/svg+xml'
//   };
//   return contentTypes[ext] || 'application/octet-stream';
// };

// // Upload image endpoint with improved error handling
// router.post('/upload-image', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const { originalname, buffer, mimetype } = req.file;
//     const filename = `${uuidv4()}-${Date.now()}${path.extname(originalname)}`;
//     const key = `${UPLOAD_FOLDER}/${filename}`;

//     // Create command to put object in S3
//     const putCommand = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key,
//       Body: buffer,
//       ContentType: mimetype || getContentType(originalname)
//     });

//     // Upload the file
//     await s3Client.send(putCommand);
    
//     // Create command to get the object (for creating signed URL)
//     const getCommand = new GetObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: key
//     });
    
//     // Generate a presigned URL that expires in 1 hour
//     const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

//     // Construct the standard S3 URL
//     const region = process.env.AWS_REGION;
//     const s3Url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

//     res.json({ 
//       success: true,
//       message: 'File uploaded successfully',
//       imageUrl: s3Url,
//       signedUrl: signedUrl,
//       key: key
//     });
//   } catch (error) {
//     console.error('Error uploading image:', error);
    
//     // Handle specific error types
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
//     }
    
//     if (error.message.includes('Invalid file type')) {
//       return res.status(400).json({ error: error.message });
//     }
    
//     res.status(500).json({ error: 'Failed to upload image to S3', details: error.message });
//   }
// });

// // Multiple file uploads endpoint
// router.post('/upload-multiple', upload.array('images', 5), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     const uploadResults = await Promise.all(
//       req.files.map(async (file) => {
//         const { originalname, buffer, mimetype } = file;
//         const filename = `${uuidv4()}-${Date.now()}${path.extname(originalname)}`;
//         const key = `${UPLOAD_FOLDER}/${filename}`;

//         // Create command to put object in S3
//         const putCommand = new PutObjectCommand({
//           Bucket: BUCKET_NAME,
//           Key: key,
//           Body: buffer,
//           ContentType: mimetype || getContentType(originalname)
//         });

//         // Upload the file
//         await s3Client.send(putCommand);
        
//         // Create command to get the object (for creating signed URL)
//         const getCommand = new GetObjectCommand({
//           Bucket: BUCKET_NAME,
//           Key: key
//         });
        
//         // Generate a presigned URL
//         const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        
//         // Construct the standard S3 URL
//         const region = process.env.AWS_REGION;
//         const s3Url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

//         return {
//           originalname,
//           key,
//           imageUrl: s3Url,
//           signedUrl
//         };
//       })
//     );

//     res.json({ 
//       success: true,
//       message: `${uploadResults.length} files uploaded successfully`,
//       files: uploadResults
//     });
//   } catch (error) {
//     console.error('Error uploading images:', error);
//     res.status(500).json({ error: 'Failed to upload images', details: error.message });
//   }
// });

// export default router;