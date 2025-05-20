import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../../helpers/paginationHelper";
import { Admin, Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./user.constant";

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = (await fileUploader.uploadToCloudinary(
      file
    )) as { secure_url: string };
    req.body.admin.profilePhoto = uploadToCloudinary.secure_url;
  }

  //hash password
  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  // Simulate admin creation logic
  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };
  console.log(userData);

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });
    return createdAdminData;
  });
  console.log(result);

  return result;
};

const getAllFromDb = async (params: any, options: IPaginationOptions) => {
  // Ensure page, limit are numbers and sortBy, sortOrder are strings
  const safeOptions = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
    sortBy: options.sortBy ?? "createdAt",
    sortOrder: options.sortOrder ?? "desc",
  };

  const { limit, page, skip } = calculatePagination(safeOptions);

  const { searchTerm, ...filterableData } = params;

  const andCondition: Prisma.UserWhereInput[] = [];

  // [
  //   {
  //     name: {
  //       contains: params.searchTerm,
  //       mode: "insensitive",
  //     },
  //   },
  //   {
  //     email: {
  //       contains: params.searchTerm,
  //       mode: "insensitive",
  //     },
  //   },
  // ],

  if (params.searchTerm) {
    andCondition.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // filterable fields
  if (Object.keys(filterableData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterableData).map((key) => ({
        [key]: {
          equals: (filterableData as any)[key],
        },
      })),
    });
  }

  // console.dir(andCondition, { depth: Infinity });

  const whereCondition: Prisma.UserWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const total = await prisma.user.count({
    where: whereCondition,
  });

  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
const updateProfileStatus = async (id: string, status: UserRole) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};

export const UserService = {
  createAdmin,
  getAllFromDb,
  updateProfileStatus,
};
