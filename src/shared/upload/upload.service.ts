import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không hợp lệ hoặc không được cung cấp.');
    }
    
    const relativePath = `/uploads/${file.filename}`;
    return {
      filename: file.filename,
      path: relativePath,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
