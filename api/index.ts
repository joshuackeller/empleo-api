import express from "express";
import cors from "cors";
import handler from "../src/middleware/handler";
import ErrorHandler from "../src/middleware/ErrorHandlers";
import prisma from "../src/utilities/prisma";

// IMPORT ADMIN ROUTES
import admin_auth from "./admin/auth";
import admin_self from "./admin/self";
import admin_organizations from "./admin/organizations";
import admin_admins from "./admin/admins";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
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

app.get(
  "/test",
  handler(async (_req, res) => {
    const KEY = "testing-ex-1";
    let cache = "hit";

    let data = await redis.get(KEY);
    if (!data) {
      cache = "missed";
      const tenSecondsFromNow = Math.floor(Date.now() / 1000) + 10;

      await redis.set(KEY, true, {
        exat: tenSecondsFromNow,
      });
    }
    data = await redis.get(KEY);
    res.json({ data, cache });
  })
);

app.get(
  "/test-sql",
  handler(async (req, res) => {
    const { id } = await prisma.admin.findUniqueOrThrow({
      where: {
        id: "qhusMq1GLufC",
      },
    });
    res.json({ id });
  })
);

// ADMIN ROUTES
app.use("/admin/auth", admin_auth);
app.use("/admin/self", admin_self);
app.use("/admin/organizations", admin_organizations);
app.use("/admin/admins", admin_admins);

app.use(ErrorHandler);

export default app;
