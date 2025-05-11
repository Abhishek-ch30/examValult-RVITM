import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USER?: string;
      DB_HOST?: string;
      DB_NAME?: string;
      DB_PASSWORD?: string;
      [key: string]: string | undefined;
    }
  }
}

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'exam_vault',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 