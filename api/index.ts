import express from "express";
import cors from "cors";
import handler from "../src/middleware/handler";
import ErrorHandler from "../src/middleware/ErrorHandler";
import prisma from "../src/utilities/prisma";
import bodyParser from "body-parser";

// IMPORT ADMIN ROUTES
import admin_auth from "./admin/auth";
import admin_self from "./admin/self";
import admin_organizations from "./admin/organizations";
import admin_admins from "./admin/admins";
import admin_listings from "./admin/listings";

// IMPORT CLIENT ROUTES
import client_organizations from "./client/organizations";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json({ limit: "50mb" }));

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
  }),
);

app.get(
  "/test",
  handler(async (_req, res) => {
    const orgs = await prisma.organization.delete({
      where: {
        id: "RB3sv4GvFBra",
      },
    });
    return res.send(JSON.stringify(orgs, "", 2));
  }),
);

// ADMIN ROUTES
app.use("/admin/auth", admin_auth);
app.use("/admin/self", admin_self);
app.use("/admin/organizations", admin_organizations);
app.use("/admin/admins", admin_admins);
app.use("/admin/listings", admin_listings);

// CLIENT ROUTES
app.use("/client/organizations", client_organizations);

app.use(ErrorHandler);

export default app;
