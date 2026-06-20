import { BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

interface UploadFields {
    name: string;
    maxCount: number;
    type: 'image' | 'video';
}

export const MultipleFilesUpload = (fields: UploadFields[]) =>
    FileFieldsInterceptor(
        fields.map(f => ({ name: f.name, maxCount: f.maxCount })),
        {
            storage: memoryStorage(),
            limits: {
                fileSize: 1 * 1024 * 1024, // 30MB
            },
            fileFilter: (req, file, cb) => {
                const fieldConfig = fields.find(f => f.name === file.fieldname);
                if (!fieldConfig) return cb(new BadRequestException('Invalid field'), false);

                if (fieldConfig.type === 'image' && !file.mimetype.startsWith('image/')) {
                    return cb(new BadRequestException('Upload only images for images field'), false);
                }
                if (fieldConfig.type === 'video' && !file.mimetype.startsWith('video/')) {
                    return cb(new BadRequestException('Upload only videos for videos field'), false);
                }
                cb(null, true);
            },
        },
    );
