import dotenv from "dotenv";

// ✅ dotenv를 한 번만 로드 (중복 실행 방지)
if (!process.env.LOADED_DOTENV) {
    dotenv.config();
    process.env.LOADED_DOTENV = "true";
}

// ✅ 환경 변수 타입 정의 (선택 사항)
interface Config {
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    LOCAL_DB: boolean;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    BASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH: string;
    CLOUD_API_KEY: string;
    CLOUD_API_SECRET: string;
    CLOUD_NAME: string;
    VITE_GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    VITE_GOOGLE_REDIRECT_URI: string;
    GOOGLE_REDIRECT_URI: string;
    VITE_KAKAO_CLIENT_ID: string;
    KAKAO_CLIENT_ID: string;
    VITE_KAKAO_REDIRECT_URI: string;
    KAKAO_REDIRECT_URI: string;
}

// ✅ 환경 변수들을 안전하게 불러오기
export const config: Config = {
    DB_HOST: process.env.DB_HOST || "",
    DB_PORT: process.env.DB_PORT || "",
    DB_USERNAME: process.env.DB_USERNAME || "",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "",
    LOCAL_DB: process.env.LOCAL_DB === "true",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: process.env.SMTP_PORT || "",
    BASE_URL: process.env.BASE_URL || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_REFRESH: process.env.JWT_REFRESH || "",
    CLOUD_API_KEY: process.env.CLOUD_API_KEY || "",
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || "",
    CLOUD_NAME: process.env.CLOUD_NAME || "",
    VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    VITE_GOOGLE_REDIRECT_URI: process.env.VITE_GOOGLE_REDIRECT_URI || "",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
    VITE_KAKAO_CLIENT_ID: process.env.VITE_KAKAO_CLIENT_ID || "",
    KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID || "",
    VITE_KAKAO_REDIRECT_URI: process.env.VITE_KAKAO_REDIRECT_URI || "",
    KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI || "",
};
