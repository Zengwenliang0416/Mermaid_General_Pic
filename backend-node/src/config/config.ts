import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  staticDir: path.join(process.cwd(), 'static'),
  imagesDir: path.join(process.cwd(), 'static/images'),
  allowedFileTypes: ['.txt', '.mmd'],
  maxFileSize: 1024 * 1024, // 1MB
  outputFormats: ['png', 'jpg', 'svg'] as const,
  dpiRange: {
    min: 300,
    max: 1200,
    default: 300
  },
  themes: ['default', 'dark', 'forest', 'neutral'] as const,
  backgrounds: ['transparent', 'white'] as const
}; 