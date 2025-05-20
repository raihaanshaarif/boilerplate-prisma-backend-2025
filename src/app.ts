import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie Parser to read cookies for JWT
app.use(cookieParser());

app.post("/", (req: Request, res: Response) => {
  res.send("Welcome to Flat share API");
});

// Router
app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    error: {
      path: req.originalUrl,
      message: "Path Not Found",
    },
  });
  next();
});

export default app;
