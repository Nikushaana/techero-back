import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Expected an image.');
    }

    const targetFolder = path.join(this.baseUploadPath, subFolder);
    await fs.ensureDir(targetFolder);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `img-${uniqueSuffix}.webp`;
    const fullPath = path.join(targetFolder, fileName);

    await sharp(file.path)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(fullPath);

    return path.posix.join('uploads', subFolder, fileName);
  }

  // async uploadVideo(file: Express.Multer.File, subFolder: string): Promise<string> {
  //   if (!file.mimetype.startsWith('video/')) {
  //     throw new BadRequestException('Invalid file type. Expected a video.');
  //   }

  //   const targetFolder = path.join(this.baseUploadPath, subFolder);
  //   await fs.ensureDir(targetFolder);

  //   const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  //   const fileName = `vid-${uniqueSuffix}.mp4`;
  //   const fullPath = path.join(targetFolder, fileName);

  //   const tempInputPath = path.join(targetFolder, `temp-${fileName}`);
  //   await fs.writeFile(tempInputPath, file.buffer);

  //   return new Promise((resolve, reject) => {
  //     ffmpeg(tempInputPath)
  //       .output(fullPath)
  //       .videoCodec('libx264')

  //       // 1. Only downscale IF the video is larger than 720p. 
  //       // This prevents small clips from expanding to fill 1280x720 pixels.
  //       .size('1280x720')
  //       .autopad()

  //       .outputOptions([
  //         '-crf 30',          // Increased to 30 (Slightly higher compression, invisible quality loss on phone screens)
  //         '-preset slow',     // CRITICAL: Tells CPU to compress harder. Takes 1-2 seconds longer but creates much smaller files
  //         '-maxrate 1200k',   // Dropped ceiling from 1500k to 1200k
  //         '-bufsize 2400k',
  //         '-pix_fmt yuv420p'  // Ensures universal playback compatibility across old web browsers
  //       ])

  //       // 2. Control the audio stream size so it doesn't inflate the container file
  //       .audioCodec('aac')
  //       .audioBitrate('64k')  // Clamps audio to 64k (Perfect for mobile voice/sounds, saves lots of space)

  //       .on('end', async () => {
  //         try {
  //           await fs.remove(tempInputPath);
  //           resolve(path.posix.join('uploads', subFolder, fileName));
  //         } catch (cleanupErr) {
  //           console.error('Failed to clean up temporary video file:', cleanupErr);
  //           resolve(path.posix.join('uploads', subFolder, fileName));
  //         }
  //       })
  //       .on('error', async (err) => {
  //         await fs.remove(tempInputPath).catch(() => { });
  //         reject(new BadRequestException(`Video compression failed: ${err.message}`));
  //       })
  //       .run();
  //   });
  // }

  async uploadVideo(file: Express.Multer.File, subFolder: string): Promise<string> {
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Invalid file type. Expected a video.');
    }

    // 1. Ensure the destination folder exists
    const targetFolder = path.join(this.baseUploadPath, subFolder);
    await fs.ensureDir(targetFolder);

    // 2. Define the permanent file path
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `vid-${uniqueSuffix}${path.extname(file.originalname)}`;
    const fullPath = path.join(targetFolder, fileName);

    try {
      // 3. Move the file from the temp storage to your Hetzner volume
      // fs.move is faster than writing a buffer because it's just a file system pointer rename
      await fs.move(file.path, fullPath);

      console.log(`Video moved to: ${fullPath}`);
      return path.posix.join('uploads', subFolder, fileName);
    } catch (err) {
      console.error("Error moving video file:", err);
      throw new InternalServerErrorException('Could not save the video file.');
    }
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