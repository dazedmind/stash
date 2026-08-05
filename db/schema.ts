import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  monthlyIncome: integer("monthly_income").notNull().default(0),
  totalIncomeReceived: integer("total_income_received").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  percentage: integer("percentage").notNull(),
  icon: text("icon").notNull().default("wallet"),
  isSafe: integer("is_safe").notNull().default(0),
  overflowSubId: text("overflow_sub_id"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subcategories = pgTable("subcategories", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  digital: integer("digital").notNull().default(0),
  cash: integer("cash").notNull().default(0),
  allocated: integer("allocated").notNull().default(0),
  isHidden: integer("is_hidden").notNull().default(0), // 0 = visible in total balance, 1 = hidden from total balance
  isSafe: integer("is_safe").notNull().default(0), // 0 = normal, 1 = safe (no expense allowed, only transfer)
  maxCap: integer("max_cap").notNull().default(0), // 0 = no cap
  overflowSubId: text("overflow_sub_id"),
  icon: text("icon").notNull().default("wallet"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subCategoryId: text("subcategory_id").references(() => subcategories.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  source: text("source"),
  description: text("description"),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payLaters = pgTable("pay_laters", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  totalAmount: integer("total_amount").notNull(),
  interestRate: integer("interest_rate").notNull().default(0),
  frequency: text("frequency").notNull().default("Monthly"),
  dueDate: text("due_date").notNull(),
  paymentType: text("payment_type").notNull().default("one_time"),
  months: integer("months").notNull().default(1),
  monthlyPayment: integer("monthly_payment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payLaterInstallments = pgTable("pay_later_installments", {
  id: text("id").primaryKey(),
  payLaterId: text("pay_later_id")
    .notNull()
    .references(() => payLaters.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  dueDate: text("due_date").notNull(),
  isPaid: integer("is_paid").notNull().default(0),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});
