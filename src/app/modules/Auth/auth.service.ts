import { prisma } from "../../../shared/prisma";
import bcrypt from "bcrypt";
import { Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { AuthUser, ChangePasswordPayload } from "./auth.constant";
import { UserStatus } from "@prisma/client";
import { send } from "process";

import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import emailSender from "./emailSender";

// const generateToken = (payload: any, secret: string, expiresIn: string) => {
//   const token = jwt.sign(payload, secret, {
//     algorithm: "HS256",
//     expiresIn,
//   } as jwt.SignOptions);

//   return token;
// };

const loginUser = async (payload: { email: string; password: string }) => {
  // Check if the user exists
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: "ACTIVE",
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData?.password || ""
  );
  if (!userData || !isCorrectPassword) {
    throw new Error("Invalid email or password");
  }

  // access token using JWT
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData?.email,
      role: userData?.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expiresIn as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData?.email,
      role: userData?.role,
    },
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpiresIn as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData?.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  // Verify the refresh token
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refreshTokenSecret as Secret
    );
  } catch (error) {
    throw new Error("Invalid refresh token");
  }

  // Check if the user exists
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: "ACTIVE",
    },
  });

  // generate new access token
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData?.email,
      role: userData?.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expiresIn as string
  );
  return {
    accessToken,
    needPasswordChange: userData?.needPasswordChange,
  };
};

const changePassword = async (
  user: AuthUser,
  payload: ChangePasswordPayload
): Promise<unknown> => {
  // Check if the user exists
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: "ACTIVE",
    },
  });

  // Check if the old password is correct
  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData?.password || ""
  );
  if (!isCorrectPassword) {
    throw new Error("Invalid old password");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  // Update the user's password
  const updatedUser = await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return updatedUser;
};

const forgetPassword = async (payload: { email: string }) => {
  // console.log(payload);
  // Check if the user exists
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  // console.log(userData);

  // Generate a reset token
  const resetToken = jwtHelpers.generateToken(
    {
      email: userData?.email,
      role: userData?.role,
    },
    config.jwt.resetPasswordSecret as Secret,
    config.jwt.resetPasswordExpiresIn as string
  );
  // console.log(resetToken);

  // Send the reset token to the user's email
  const resetLink =
    config.reset_pass_link + `?userId=${userData?.id}&token=${resetToken}`;
  console.log(resetLink);
  await emailSender({
    to: userData?.email,
    subject: "Password Reset",
    // text: `Click the link to reset your password: ${resetLink}`,
    html: `<a href="${resetLink}">Click here to reset your password</a>`,
  });

  console.log(resetLink);
};

const resetPassword = async (payload: {
  userId: string;
  token: string;
  newPassword: string;
}) => {
  // Verify the reset token
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      payload.token,
      config.jwt.resetPasswordSecret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid reset token");
  }

  // Check if the user exists
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.userId,
      status: UserStatus.ACTIVE,
    },
  });

  // Hash the new password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  // Update the user's password
  const updatedUser = await prisma.user.update({
    where: {
      id: payload.userId,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return updatedUser;
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
