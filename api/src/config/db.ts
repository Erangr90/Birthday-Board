import mongoose from "mongoose"
import logger from "./logger"
import { logDbOperation } from "../utils/analytics"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: process.env.DB_NAME,
      maxPoolSize: 20,
    })

    logger.info("MongoDB connected")
    logDbOperation("connect", "success")
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown MongoDB error"
    logger.error(`MongoDB connection failed: ${message}`)
    logDbOperation("connect", "failure", { errorMessage: message })
    process.exit(1)
  }
}

mongoose.connection.on("error", (error: Error) => {
  logger.error(`MongoDB error: ${error.message}`)
  logDbOperation("connection", "failure", { errorMessage: error.message })
})

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected")
  logDbOperation("disconnected", "failure")
})

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected")
  logDbOperation("reconnected", "success")
})

export default connectDB
