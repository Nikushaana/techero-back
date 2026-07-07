import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
  private readonly baseUploadPath: string;

  constructor(private configService: ConfigService) {
    this.baseUploadPath = this.configService.get<string>('VOLUME_PATH') || '/app/uploads';
  }

  async uploadImage(file: Express.Multer.File, subFolder: string): Promise<string> {
    const targetFolder = path.join(this.baseUploadPath, subFolder);
    await fs.ensureDir(targetFolder);

    const fileName = `img-${Date.now()}.webp`;
    const fullPath = path.join(targetFolder, fileName);

    await sharp(file.buffer)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(fullPath);

    return path.posix.join('uploads', subFolder, fileName);
  }

  async uploadVideo(file: Express.Multer.File, subFolder: string): Promise<string> {
    const targetFolder = path.join(this.baseUploadPath, subFolder);
    await fs.ensureDir(targetFolder);

    const fileName = `vid-${Date.now()}.mp4`;
    const fullPath = path.join(targetFolder, fileName);

    // Convert the buffer to a readable stream
    const videoStream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(videoStream) // Pass the stream instead of file.path
        .output(fullPath)
        .videoCodec('libx264')
        .size('?x720')
        .autopad()
        .outputOptions([
          '-crf 30',
          '-preset slow',
          '-maxrate 1200k',
          '-bufsize 2400k',
          '-pix_fmt yuv420p'
        ])
        .audioCodec('aac')
        .audioBitrate('64k')
        .on('end', () => {
          resolve(path.posix.join('uploads', subFolder, fileName));
        })
        .on('error', (err) => {
          reject(new BadRequestException(`Video compression failed: ${err.message}`));
        })
        .run();
    });
  }

  async deleteFile(relativeFilePath: string): Promise<void> {
    if (!relativeFilePath) return;

    const cleanRelativePath = relativeFilePath.replace(/^uploads[/\\]/, '');

    const fullPath = path.join(this.baseUploadPath, cleanRelativePath);
    try {
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
      }
    } catch (err) {
      console.error(`Failed to delete asset on Hetzner volume: ${fullPath}`, err);
    }
  }
}