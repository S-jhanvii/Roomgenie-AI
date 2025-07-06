import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import Replicate from "replicate";
import cloudinary from "cloudinary";
import cors from "cors";
import fetch from "node-fetch";
import { Buffer } from "buffer";

dotenv.config();

// Configure services
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
const upload = multer({ dest: "uploads/" });

// Helper to get image URL from any Replicate output format
function getOutputUrl(output) {
  if (!output) return null;
  
  // Case 1: Direct URL string
  if (typeof output === "string" && output.startsWith("http")) {
    return output;
  }
  
  // Case 2: Array of URLs
  if (Array.isArray(output) && output[0] && output[0].startsWith("http")) {
    return output[0];
  }
  
  // Case 3: Object with URL property
  if (typeof output === "object" && output.url && output.url.startsWith("http")) {
    return output.url;
  }
  
  return null;
}

app.post("/api/redesign", upload.single("photo"), async (req, res) => {
  try {
    // 1. Upload original image
    const originalUpload = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "Roomgenie/originals",
    });

    // 2. Call Replicate API
    const prediction = await replicate.predictions.create({
      version: "76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
      input: {
        image: originalUpload.secure_url,
        prompt: req.body.theme,
      },
    });

    // 3. Get final prediction (simple wait)
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
    const finalPrediction = await replicate.predictions.get(prediction.id);

    // 4. Extract output URL
    const outputUrl = getOutputUrl(finalPrediction.output);
    if (!outputUrl) {
      throw new Error("Could not get valid output URL from Replicate");
    }

    // 5. Process and return result
    const imageResponse = await fetch(outputUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const cloudinaryResult = await cloudinary.v2.uploader.upload(
      `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`,
      { folder: "Roomgenie/generated" }
    );

    res.json({ 
      success: true,
      redesignedImageUrl: cloudinaryResult.secure_url,
      originalImageUrl: originalUpload.secure_url 
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: "Room generation failed. Please try again with a different image."
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});