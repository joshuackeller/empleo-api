import express from "express";
import cors from "cors";
import handler from "../src/middleware/handler";
import ErrorHandler from "../src/middleware/ErrorHandler";
import prisma from "../src/utilities/prisma";

// IMPORT ADMIN ROUTES
import admin_auth from "../routes/admin/auth";
import admin_self from "../routes/admin/self";
import admin_organizations from "../routes/admin/organizations";
import admin_admins from "../routes/admin/admins";
import admin_listings from "../routes/admin/listings";
import admin_applications from "../routes/admin/applications";

// IMPORT CLIENT ROUTES
import client_organizations from "../routes/client/organizations";
import client_auth from "../routes/client/auth";
import client_listings from "../routes/client/listings";
import client_applications from "../routes/client/applications";
import client_listing_applications from "../routes/client/listings/applications";

const app = express();

app.use(
  cors({
    origin: "*",
  })
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
  })
);

// ADMIN ROUTES
app.use("/admin/auth", admin_auth);
app.use("/admin/self", admin_self);
app.use("/admin/organizations", admin_organizations);
app.use("/admin/admins", admin_admins);
app.use("/admin/listings", admin_listings);
app.use("/admin/applications", admin_applications);
//app.use("/admin/listings/applications", admin_listings_applications);

// CLIENT ROUTES
app.use("/client/auth", client_auth);
app.use("/client/organizations", client_organizations);
app.use("/client/listings", client_listings);
app.use(
  "/client/listings/:listingId/applications",
  client_listing_applications
);
app.use("/client/applications", client_applications);

app.use(ErrorHandler);

export default app;
