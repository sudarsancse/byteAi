import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../Config/aws-s3.js";

// SEND THE DATA IN AWS S3 BUCKET
export const uploadToS3 = async (filename, buffer, contentType) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: buffer,
      Key: filename,
      ContentType: contentType,
    }),
  );
};
