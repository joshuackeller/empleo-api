import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
  boolean,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const admin = pgTable(
  "admin",
  {
    id: text("id").primaryKey().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email").notNull(),
    emailConfirmed: boolean("email_confirmed").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
    selfCreated: boolean("self_created").default(false).notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("admin_email_key").on(table.email),
    };
  }
);

export const password = pgTable(
  "password",
  {
    id: text("id").primaryKey().notNull(),
    adminId: text("admin_id").references(() => admin.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    hash: text("hash").notNull(),
  },
  (table) => {
    return {
      adminIdKey: uniqueIndex("password_admin_id_key").on(table.adminId),
      userIdKey: uniqueIndex("password_user_id_key").on(table.userId),
    };
  }
);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email").notNull(),
    emailConfirmed: boolean("email_confirmed").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("user_email_key").on(table.email),
    };
  }
);

export const organization = pgTable("organization", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    precision: 3,
    mode: "string",
  }).notNull(),
});

export const organizationToUser = pgTable(
  "_OrganizationToUser",
  {
    organizationId: text("A")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("B")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => {
    return {
      abUnique: uniqueIndex("_OrganizationToUser_AB_unique").on(
        table.organizationId,
        table.userId
      ),
      bIdx: index().on(table.userId),
    };
  }
);

export const adminToOrganization = pgTable(
  "_AdminToOrganization",
  {
    adminId: text("A")
      .notNull()
      .references(() => admin.id, { onDelete: "cascade", onUpdate: "cascade" }),
    organizationId: text("B")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      abUnique: uniqueIndex("_AdminToOrganization_AB_unique").on(
        table.adminId,
        table.organizationId
      ),
      bIdx: index().on(table.organizationId),
    };
  }
);

export const adminRelations = relations(admin, ({ many, one }) => ({
  adminToOrganization: many(adminToOrganization),
  password: one(password, {
    fields: [admin.id],
    references: [password.adminId],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  adminToOrganization: many(adminToOrganization),
}));

export const usersToGroupsRelations = relations(
  adminToOrganization,
  ({ one }) => ({
    organization: one(organization, {
      fields: [adminToOrganization.organizationId],
      references: [organization.id],
    }),
    admin: one(admin, {
      fields: [adminToOrganization.adminId],
      references: [admin.id],
    }),
  })
);
