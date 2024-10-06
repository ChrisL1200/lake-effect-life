import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
});

const bucketName = process.env.S3_BUCKET!;

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
    const key = `${uuidv4()}-${file.originalname}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
    };

    await s3.upload(params).promise();
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

