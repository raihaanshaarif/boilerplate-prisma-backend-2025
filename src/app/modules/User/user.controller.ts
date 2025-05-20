import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { pick } from "../../../shared/pick";
import { userFilterableFields } from "./user.constant";
import { UserService } from "./user.service";

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.file);
  // console.log(req.body.data);
  try {
    const result = await UserService.createAdmin(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllFromDb = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await UserService.getAllFromDb(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateProfileStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.updateProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
};

export const UserController = {
  createAdmin,
  getAllFromDb,
  updateProfileStatus,
};
