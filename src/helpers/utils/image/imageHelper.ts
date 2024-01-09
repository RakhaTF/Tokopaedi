import path from "path"
import fs from 'fs';
import { DeliveryType, ResourceType, ResponseCallback, UploadApiResponse, v2 as cloudinary } from 'cloudinary'
import { File } from "fastify-multer/lib/interfaces";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

export async function UploadImage(request: File): Promise<UploadApiResponse> {
    // Get the file from the request
    const file = request
    // Define the destination path for the uploaded file
    const destPath = path.resolve(__dirname, '../../../uploads', file.filename);

    // Now that the file is saved locally, we can upload it to Cloudinary
    const buffer = fs.readFileSync(destPath);

    return new Promise((resolve, reject) => {
        //extracting filename and removing the file extension.
        const filename = file.filename.split('.')[0]
        cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: "tokopaedi/products", upload_preset: "tokopaedi", public_id: filename },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    //will delete the file after every successful upload.
                    fs.unlinkSync(destPath);
                    resolve(result);
                }
            }
        ).end(buffer);
    });
}

export async function DeleteImage(public_id: string, options?: { resource_type?: ResourceType; type?: DeliveryType; invalidate?: boolean; }, callback?: ResponseCallback) {
    cloudinary.uploader.destroy(public_id, options, callback).then(callback)
}