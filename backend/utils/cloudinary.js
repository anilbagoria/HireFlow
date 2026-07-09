import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

export default cloudinary;