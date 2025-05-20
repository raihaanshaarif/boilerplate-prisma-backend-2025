import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "driq3j4rp",
  api_key: "316177215937155",
  api_secret: "j-U8ykFxrM_dO0ckrkXxCRCrJSU", // Click 'View API Keys' above to copy your API secret
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//Cloudinary upload

const uploadToCloudinary = async (file: any) => {
  return new Promise(async (resolve, reject) => {
    const uploadResult = await cloudinary.uploader.upload(
      file.path,
      { public_id: file.filename },
      (error, result) => {
        fs.unlinkSync(file.path); // Delete the file after upload
        if (error) {
          // console.log("Error uploading to Cloudinary:", error);
          reject(error);
        } else {
          // console.log("Uploaded to Cloudinary:", result);

          resolve(result);
        }
      }
    );
  });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
