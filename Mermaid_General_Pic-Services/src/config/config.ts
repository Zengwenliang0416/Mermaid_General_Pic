import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  staticDir: path.join(__dirname, '../../static'),
  imagesDir: path.join(__dirname, '../../static/images'),
  allowedFileTypes: ['.txt', '.mmd'],
  maxFileSize: 1024 * 1024, // 1MB
  outputFormats: ['png', 'jpg', 'svg'] as const,
  dpiRange: {
    min: 300,
    max: 1200,
    default: 300
  },
  themes: ['default', 'dark', 'forest', 'neutral'] as const,
  backgrounds: ['transparent', 'white'] as const,
  kimiApiKey: process.env.KIMI_API_KEY || ''
}; 