const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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
        const { template_url, selfie_urls, positive_prompt, negative_prompt, ip_weight, cn_strength, 
            control_pose, template_denoise, steps, style_image, style_weight, method } = req.body;

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
                    positive_prompt: positive_prompt,
                    negative_prompt: negative_prompt,
                    ip_weight: ip_weight,
                    cn_strength: cn_strength,
                    control_pose: control_pose,
                    template_denoise: template_denoise,
                    steps: steps,
                    style_image: style_image,
                    style_weight: style_weight,
                    eyes_blend_factor: 0.6,
                    image_width: 1024,
                    image_height: 1024,
                    upscale_value: 1.3,
                    method: method
                }
            })
        };

        console.log(requestConfig.body);

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


// Add this endpoint to your server.js
app.post('/api/process-payment', async (req, res) => {
    try {
      const { paymentMethodId, amount } = req.body;
      
      if (!paymentMethodId || !amount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required parameters' 
        });
      }
  
      // Get the frontend origin for the return URL
      const origin = req.headers.origin || 'http://localhost:5173';
      const returnUrl = `${origin}/donate`;
  
      // Convert amount to cents (Stripe uses smallest currency unit)
      const amountInCents = Math.round(amount * 100);
      
      // Create payment intent with redirect support
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: returnUrl, // URL to return to after authentication
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always' // Allow redirects for 3D Secure etc.
        },
        description: `Donation of $${amount}`,
        metadata: {
          donation_amount: amount.toString()
        }
      });
      
      // Check payment status - ensure we only send one response
      if (paymentIntent.status === 'succeeded') {
        // Payment completed successfully without additional authentication
        return res.json({ 
          success: true, 
          paymentIntentId: paymentIntent.id 
        });
      } else if (paymentIntent.status === 'requires_action' && 
                paymentIntent.next_action && 
                paymentIntent.next_action.type === 'redirect_to_url') {
        // Payment requires 3D Secure or other redirect
        return res.json({
          success: false,
          requires_action: true,
          redirect_url: paymentIntent.next_action.redirect_to_url.url,
          payment_intent_id: paymentIntent.id
        });
      } else {
        // Some other status
        return res.json({ 
          success: false, 
          status: paymentIntent.status,
          error: 'Payment requires additional steps'
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Send a clean error message to the client
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Payment processing failed'
      });
    }
  });


if (process.env.NODE_ENV === 'production') {
    // Will serve production assets
    app.use(express.static('../dist'));

    // Will serve the index.html if the route isn't recognized
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
    });
}


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});