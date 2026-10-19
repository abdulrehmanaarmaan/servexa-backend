import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { AppError } from "../utils/appError.js";
import config from "../config/index.js";

export const SERVICE_IMAGE_FOLDER = "servexa/services";

// Configured lazily so it works no matter when dotenv loads.
function getCloudinary() {
  const cloudName = config.cloudinary_cloud_name;
  const apiKey = config.cloudinary_api_key;
  const apiSecret = config.cloudinary_api_secret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(500, "Image storage is not configured");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function uploadServiceImage(buffer: Buffer) {
  const client = getCloudinary();
  console.log("Using cloud:", config.cloudinary_cloud_name, config.cloudinary_api_key)

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: SERVICE_IMAGE_FOLDER,
        resource_type: "image",
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function deleteServiceImage(publicId: string) {
  try {
    await getCloudinary().uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    // Never fail the request because an old image could not be removed.
    console.error("Cloudinary delete failed:", publicId, error);
  }
}

// Stops a client from sending arbitrary URLs / public IDs.
export function isValidServiceImage(imageUrl: string, publicId: string) {
  const cloudName = config.cloudinary_cloud_name;

  return (
    Boolean(cloudName) &&
    imageUrl.startsWith(`https://res.cloudinary.com/${cloudName}/`) &&
    publicId.startsWith(`${SERVICE_IMAGE_FOLDER}/`) &&
    imageUrl.includes(publicId)
  );
}