import express from "express";
import cors from "cors";
import handler from "../src/middleware/handler";
import errorHandler from "../src/middleware/ErrorHandler";
import prisma from "../src/utilities/prisma";

// IMPORT ADMIN ROUTES
import admin_auth from "./admin/auth";
import admin_self from "./admin/self";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.options(
  "*",
  cors({
    origin: "*",
  })
);

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

// ADMIN ROUTES
app.use("/admin/auth", admin_auth);
app.use("/admin/self", admin_self);

app.use(errorHandler);

export default app;
