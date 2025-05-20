import { UserStatus } from "@prisma/client";
import { z } from "zod";

export const createAdmin = z.object({
  password: z.string(),
  admin: z.object({
    name: z.string(),
    email: z.string().email(),
    contactNumber: z.string(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
});

export const UserValidation = {
  createAdmin,
  updateStatus,
};
