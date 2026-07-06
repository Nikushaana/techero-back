import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const MultipleImagesUpload = (field: string, maxCount = 1) =>
    FilesInterceptor(field, maxCount, {
        storage: diskStorage({
            destination: '/app/uploads', // Ensure this matches your Coolify volume path
            filename: (req, file, cb) => {
                const name = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${name}${extname(file.originalname)}`);
            },
        }),
        limits: {
            fileSize: 30 * 1024 * 1024, // 30 MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ სურათი!'), false);
            }
            cb(null, true);
        },
    });