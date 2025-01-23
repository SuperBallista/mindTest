import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Result } from './entities/Result';
import { Comment } from './entities/Comment';
import dotenv from 'dotenv';
import { TempPost } from './entities/TempPost';
import { TempUpload } from './entities/TempUpload';
import { Post } from './entities/Post';

// 환경변수 로드
dotenv.config();


export const AppDataSource = new DataSource({
  type: 'mysql', //  mysql 사용
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Post, Result, Comment, TempPost,TempUpload ], // 엔터티 경로 설정
  extra: {
    connectionLimit: 10, // 최대 연결 수
    connectTimeout: 20000, // 연결 제한 시간 (ms)
  },
});

if (!AppDataSource.isInitialized) {
  AppDataSource.initialize()
      .then(() => console.log('Database connection established!'))
      .catch((err) => {console.error('Database connection error:', err)});
}
