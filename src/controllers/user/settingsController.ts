import { Response } from "express";
import { AuthRequest } from "../../types/AuthRequest";
import User from "../../models/user";
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserRequestBody } from "../../types/ReqBody";
import { bucket } from "../..";

// export const updateSettings = async (req: AuthRequest<UpdateUserRequestBody>, res: Response) => {
//     try {
//         const userId = req.user?.id;
//         const { firstName, lastName, title, company, about, phone, country, city, address } = req.body;

//         if (!userId) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }

//         // If an avatar image is provided in the request, handle the file upload
//         let avatarUrl = '';
//         if (req.file) {
//             const avatarFile = req.file;
//             const uniqueFileName = `${uuidv4()}-${avatarFile.originalname}`;
//             const blob = bucket.file(uniqueFileName);

//             const blobStream = blob.createWriteStream({
//                 metadata: {
//                     contentType: avatarFile.mimetype, // Ensure correct MIME type is set
//                 }
//             });

//             blobStream.on('error', (err) => {
//                 console.error('File upload error:', err);
//                 return res.status(500).json({ message: 'Avatar upload failed' });
//             });

//             blobStream.on('finish', async () => {
//                 try {
//                     await blob.makePublic();
//                     avatarUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

//                     // Update the user's avatar, name, and details in the database
//                     const updatedUser = await User.findOneAndUpdate(
//                         { _id: userId },
//                         {
//                             $set: {
//                                 firstName, lastName, avatar: avatarUrl,
//                                 details: { title, company, about, phone, country, city, address }
//                             }
//                         },
//                         { new: true, runValidators: true }
//                     );

//                     if (!updatedUser) {
//                         return res.status(404).json({ message: 'User not found' });
//                     }

//                     return res.status(200).json({ message: 'User updated successfully', avatarUrl });
//                 } catch (err) {
//                     console.error('Error making file public:', err);
//                     return res.status(500).json({ message: 'Failed to generate public URL for avatar' });
//                 }
//             });

//             blobStream.end(avatarFile.buffer);
//         } else {
//             // If no avatar image is provided, update only the user information and details
//             const updatedUser = await User.findOneAndUpdate(
//                 { _id: userId },
//                 {
//                     $set: {
//                         firstName, lastName,
//                         details: { title, company, about, phone, country, city, address }
//                     }
//                 },
//                 { new: true, runValidators: true }
//             );

//             if (!updatedUser) {
//                 return res.status(404).json({ message: 'User not found' });
//             }

//             return res.status(200).json({ message: 'User updated successfully' });
//         }
//     } catch (error) {
//         console.error('Error updating profile:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// }

export const updateSettings = async (req: AuthRequest<UpdateUserRequestBody>, res: Response) => {
    try {
        const userId = req.user?.id;
        const { firstName, lastName, title, company, about, phone, country, city, address, birthday } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    firstName, lastName,
                    details: { title, company, about, phone, country, city, address, birthday }
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { _id, avatar, details } = updatedUser;

        return res.status(200).json({
            message: 'User updated successfully',
            updatedUser: {
                _id,
                firstName,
                lastName,
                avatar,
                details
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};