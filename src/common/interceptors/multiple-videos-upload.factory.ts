import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const MultipleVideosUpload = (field: string, maxCount = 1) =>
    FilesInterceptor(field, maxCount, {
        storage: memoryStorage(),
        limits: {
                fileSize: 30 * 1024 * 1024, // 30MB
            },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('video/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ ვიდეო!'), false);
            }
            cb(null, true);
        },
    });