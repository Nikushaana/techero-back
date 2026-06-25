import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';

const UPLOAD_TEMP_PATH = './temp/uploads';
fs.ensureDirSync(UPLOAD_TEMP_PATH);

export const MultipleImagesUpload = (field: string, maxCount = 1) =>
    FilesInterceptor(field, maxCount, {
        storage: diskStorage({
            destination: UPLOAD_TEMP_PATH,
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 20 * 1024 * 1024, // 20 MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ სურათი!'), false);
            }
            cb(null, true);
        },
    });