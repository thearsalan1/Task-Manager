import crypto from 'crypto';
import { env } from '../config/env';

const algorithm = 'aes-256-ctr';
const key = Buffer.from(env.taskEncKey, 'hex');

export const encryptText = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('hex');
};

export const decryptText = (hash: string): string => {
  const buffer = Buffer.from(hash, 'hex');
  const iv = buffer.subarray(0, 16); 
  const encrypted = buffer.subarray(16);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};