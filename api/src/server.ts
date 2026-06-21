import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db";
import connectRedis from "./config/redis";
import { rebuildAllUsersBirthdaySort } from "./utils/userBirthdaySort";
import startTodayUsersCron, { runTodayUsersCacheJob } from "./jobs/todayUsersCron";
import startBirthdaySortCron from "./jobs/birthdaySortCron";
import { notFound, errorHandler } from "./middlewares/errorsMiddlewares";
import { requestContext } from "./middlewares/requestContext";
import logger from "./config/logger";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { getAllowedOrigins } from "./utils/corsOrigins";

const app = express();

dotenv.config({ quiet: true });
const port = process.env.PORT || 5000;




app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(requestContext);


app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});


app.use(notFound);
app.use(errorHandler);


const appInstance = process.env.NODE_APP_INSTANCE;
const isPrimaryInstance = appInstance === undefined || appInstance === "0";


const startServer = async () => {
  await connectDB();
  await connectRedis();

  if (isPrimaryInstance) {
    await rebuildAllUsersBirthdaySort();
    await runTodayUsersCacheJob("startup");
    startTodayUsersCron();
    startBirthdaySortCron();
  }

  app.listen(port as number, "0.0.0.0", () => {
    logger.info(`Server is running on port ${port}`);
  });
};

startServer();
