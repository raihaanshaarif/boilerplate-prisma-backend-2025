import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

dotenv.config({});

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expiresIn: process.env.EXPIRES_IN,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    resetPasswordSecret: process.env.RESET_PASSWORD_SECRET,
    resetPasswordExpiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    password: process.env.APP_PASSWORD,
  },
};
