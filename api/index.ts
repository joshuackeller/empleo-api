import express from "express";
import cors from "cors";
import adminAuth from "./admin/auth";
import handler from "../src/middleware/handler";
import errorHandler from "../src/middleware/errorHandler";
import prisma from "../src/utilities/prisma";

const app = express();

app.use(cors());
app.use(express.json());

// TEST ENDPOINT
app.get(
  "/",
  handler(async (_req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: "test",
      },
    });
    res.json(user);
  })
);

// ROUTES
app.use("/admin/auth", adminAuth);

app.use(errorHandler);

export default app;
