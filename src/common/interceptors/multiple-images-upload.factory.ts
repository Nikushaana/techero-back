import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const MultipleImagesUpload = (field: string, maxCount = 1) =>
    FilesInterceptor(field, maxCount, {
        storage: memoryStorage(),
        limits: {
            fileSize: 20 * 1024 * 1024, // 15 MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ სურათი!'), false);
            }
            cb(null, true);
        },
    });