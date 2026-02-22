import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";

type S3Client = {
  upload: (params: unknown) => { promise: () => Promise<unknown> };
};

let s3: S3Client | null = null;

const getS3Client = (): S3Client | null => {
  if (s3) {
    return s3;
  }

  let awsSdk: any;
  try {
    // Lazy load to avoid hard startup dependency on aws-sdk in local/dev setups.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    awsSdk = require("aws-sdk");
  } catch {
    return null;
  }

  s3 = new awsSdk.S3({
    region: process.env.AWS_REGION,
  });
  return s3;
};

const bucketName = process.env.S3_BUCKET;

const hasConfiguredS3 = () => {
  if (!bucketName || !process.env.AWS_REGION) {
    return false;
  }
  if (bucketName.includes("your_s3_bucket_name")) {
    return false;
  }
  return true;
};

const resolveLocalUploadDir = () => {
  const fromBackendCwd = path.resolve(
    process.cwd(),
    "../frontend/public/images/groupedItems",
  );
  const fromRepoCwd = path.resolve(
    process.cwd(),
    "apps/frontend/public/images/groupedItems",
  );
  return process.cwd().endsWith(path.join("apps", "backend"))
    ? fromBackendCwd
    : fromRepoCwd;
};

const saveImageLocally = async (file: Express.Multer.File): Promise<string> => {
  const uploadDir = resolveLocalUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
  const fileName = `${uuidv4()}${extension}`;
  await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
  return fileName;
};

export const uploadImage = async (
  file: Express.Multer.File,
): Promise<string> => {
  const s3Client = getS3Client();

  if (!hasConfiguredS3() || !s3Client) {
    return saveImageLocally(file);
  }

  const key = `${uuidv4()}-${file.originalname}`;
  const params = {
    Bucket: bucketName as string,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  await s3Client.upload(params).promise();
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
