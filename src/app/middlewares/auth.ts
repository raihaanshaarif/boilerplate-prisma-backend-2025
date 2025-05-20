import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as string
      );
      req.user = verifiedUser;
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
