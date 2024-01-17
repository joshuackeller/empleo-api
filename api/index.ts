import express from "express";
import cors from "cors";
import handler from "../src/middleware/handler";
import ErrorHandler from "../src/middleware/ErrorHandler";
import prisma from "../src/utilities/prisma";

// IMPORT ADMIN ROUTES
import admin_auth from "./admin/auth";
import admin_self from "./admin/self";
import admin_organizations from "./admin/organizations";
import admin_admins from "./admin/admins";

import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";
import postgres from "postgres";
import { eq, sql as s } from "drizzle-orm";

const sql = postgres(process.env.PROXY_URL!, { ssl: "require" });
const db = drizzle(sql, { schema });

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
  "/test/drizzle",
  handler(async (_req, res) => {
    await db.query.organization.findFirst({
      where: eq(schema.organization.id, "WF66qJINtSY9"),
      with: {
        adminToOrganization: {
          with: {
            admin: {
              with: {
                password: true,
              },
            },
          },
        },
      },
    });

    const start = Date.now();

    for (let i = 0; i < 10; i++) {
      await db.query.organization.findFirst({
        where: eq(schema.organization.id, "WF66qJINtSY9"),
        with: {
          adminToOrganization: {
            with: {
              admin: {
                with: {
                  password: true,
                },
              },
            },
          },
        },
      });
    }

    const time = (Date.now() - start) / 10;

    res.json({ time });
  })
);

const prepared = db.query.organization
  .findFirst({
    where: (organization, { eq }) => eq(organization.id, s.placeholder("id")),
    with: {
      adminToOrganization: {
        with: {
          admin: {
            with: {
              password: true,
            },
          },
        },
      },
    },
  })
  .prepare("test");

app.get(
  "/test/drizzlep",
  handler(async (_req, res) => {
    await prepared.execute({ id: "WF66qJINtSY9" });

    const start = Date.now();

    for (let i = 0; i < 10; i++) {
      await prepared.execute({ id: "WF66qJINtSY9" });
    }

    const time = (Date.now() - start) / 10;

    res.json({ time });
  })
);

app.get(
  "/test/prisma",
  handler(async (req, res) => {
    // warmup
    await prisma.organization.findFirst({
      where: {
        id: "WF66qJINtSY9",
      },
      include: {
        admins: {
          include: {
            password: true,
          },
        },
      },
    });

    const start = Date.now();

    for (let i = 0; i < 10; i++) {
      await prisma.organization.findFirst({
        where: {
          id: "WF66qJINtSY9",
        },
        include: {
          admins: {
            include: {
              password: true,
            },
          },
        },
      });
    }

    const time = (Date.now() - start) / 10;

    res.json({
      time,
    });
  })
);

// ADMIN ROUTES
app.use("/admin/auth", admin_auth);
app.use("/admin/self", admin_self);
app.use("/admin/organizations", admin_organizations);
app.use("/admin/admins", admin_admins);

app.use(ErrorHandler);

export default app;
