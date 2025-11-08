"use server"
import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const Bucket = process.env.AMPLIFY_BUCKET;
export const uploadImage = async (name: string) => {
    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });
    const command = new PutObjectCommand({
        Bucket,
        Key: `images/${name}`,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { url };
}

export const uploadJson = async (name: string) => {
    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });
    const command = new PutObjectCommand({
        Bucket,
        Key: `json/${name}`,
        ContentType: "application/json"
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { url };
}