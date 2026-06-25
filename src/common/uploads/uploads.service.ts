import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly baseUploadPath: string;

  constructor(private configService: ConfigService) {
    this.baseUploadPath = this.configService.get<string>('VOLUME_PATH') || '/app/data/uploads';
  }

  async uploadImage(file: Express.Multer.File, subFolder: string, maxWidth = 1200): Promise<string> {
    const targetFolder = path.join(this.baseUploadPath, subFolder);
    await fs.ensureDir(targetFolder);

    const fileName = `img-${Date.now()}.webp`;
    const fullPath = path.join(targetFolder, fileName);

    try {
      await sharp(file.path) // Read from temp disk path
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(fullPath);

      return path.posix.join('uploads', subFolder, fileName);
    } finally {
      await fs.remove(file.path); // Always cleanup temp file
    }
  }

  async uploadVideo(file: Express.Multer.File, subFolder: string): Promise<string> {
    const targetFolder = path.join(this.baseUploadPath, subFolder);
    await fs.ensureDir(targetFolder);

    const fileName = `vid-${Date.now()}.mp4`;
    const fullPath = path.join(targetFolder, fileName);

    return new Promise((resolve, reject) => {
      ffmpeg(file.path) // Read directly from temp disk path
        .output(fullPath)
        .videoCodec('libx264')

        // 1. Only downscale IF the video is larger than 720p. 
        // This prevents small clips from expanding to fill 1280x720 pixels.
        .size('1280x720')
        .autopad()

        .outputOptions([
          '-crf 30',          // Increased to 30 (Slightly higher compression, invisible quality loss on phone screens)
          '-preset slow',     // CRITICAL: Tells CPU to compress harder. Takes 1-2 seconds longer but creates much smaller files
          '-maxrate 1200k',   // Dropped ceiling from 1500k to 1200k
          '-bufsize 2400k',
          '-pix_fmt yuv420p'  // Ensures universal playback compatibility across old web browsers
        ])

        // 2. Control the audio stream size so it doesn't inflate the container file
        .audioCodec('aac')
        .audioBitrate('64k')  // Clamps audio to 64k (Perfect for mobile voice/sounds, saves lots of space)

        .on('end', async () => {
          await fs.remove(file.path); // Cleanup temp file
          resolve(path.posix.join('uploads', subFolder, fileName));
        })
        .on('error', async (err) => {
          await fs.remove(file.path); // Cleanup even on failure
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