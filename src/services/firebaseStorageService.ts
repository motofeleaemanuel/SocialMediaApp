
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '..';

export const uploadFileToFirebase = (file: Express.Multer.File, userId: string) => {
    return new Promise<string>((resolve, reject) => {
        const uniqueFileName = `${userId}/${uuidv4()}-${file.originalname}`;
        const blob = bucket.file(uniqueFileName);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on("error", (err) => reject(err));
        blobStream.on("finish", async () => {
            try {
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(file.buffer);
    });
};