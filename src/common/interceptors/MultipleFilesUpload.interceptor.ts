import { BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';

interface UploadFields {
    name: string;
    maxCount: number;
    type: 'image' | 'video';
}

const UPLOAD_TEMP_PATH = './temp/uploads';
fs.ensureDirSync(UPLOAD_TEMP_PATH);

export const MultipleFilesUpload = (fields: UploadFields[]) =>
    FileFieldsInterceptor(
        fields.map(f => ({ name: f.name, maxCount: f.maxCount })),
        {
            storage: diskStorage({
                destination: UPLOAD_TEMP_PATH,
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
                },
            }),
            limits: {
                fileSize: 30 * 1024 * 1024, // 30MB
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
