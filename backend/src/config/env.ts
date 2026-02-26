import dotenv from "dotenv"
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  taskEncKey: process.env.TASK_ENC_KEY as string,
  taskEncIv: process.env.TASK_ENC_IV as string,
  frontendUrl: process.env.FRONTEND_URL as string,
  nodeEnv: process.env.NODE_ENV || 'development',
};

const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'TASK_ENC_KEY', 'FRONTEND_URL'];
for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}