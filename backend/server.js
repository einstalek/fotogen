const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// app.use(cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true
//   }));

app.use(express.json());

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_BUCKET;
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { originalname, buffer, mimetype } = req.file;
    const filename = `${uuidv4()}${path.extname(originalname)}`;
    const key = `input/${filename}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype
    }));

    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ success: true, imageUrl: s3Url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/submit-runpod-job', async (req, res) => {
    try {
        const { template_url, selfie_urls, prompt, negative_prompt, resemblance, cn_strength, steps } = req.body;

        if (!template_url || !selfie_urls || selfie_urls.length === 0) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const url = `${process.env.RUNPOD_API_URI}/run/`;  // ✅ Fix the URL

        const requestConfig = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.RUNPOD_API_KEY}` // Store API key in `.env`
            },
            body: JSON.stringify({
                input: {
                    template_image: template_url,
                    selfie_images: selfie_urls,
                    positive_prompt: prompt,
                    negative_prompt: negative_prompt,
                    ip_weight: resemblance,
                    cn_strength: cn_strength,
                    steps: [steps, steps, steps, steps]
                }
            })
        };

        const response = await fetch(url, requestConfig);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`RunPod API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Error submitting job to RunPod:', error);
        res.status(500).json({ error: 'Failed to submit job', details: error.message });
    }
});

app.get('/api/check-runpod-job/:id', async (req, res) => {
    const jobId = req.params.id;

    const url = `${process.env.RUNPOD_API_URI}/status/${jobId}`;  // ✅ Fix the URL

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.RUNPOD_API_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("RunPod API error:", response.status, errorText);
            return res.status(response.status).json({ error: `RunPod API Error: ${errorText}` });
        }

        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error("Error checking job status:", error);
        res.status(500).json({ error: "Failed to check job status", details: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});