import { pgTable, serial, varchar, timestamp, integer, decimal, pgEnum } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingStatus = pgEnum("booking_status", ["booked", "confirmed", "cancelled"]);

export const bookingTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => userTable.id ).notNull(),
  car_name: varchar("car_name", { length: 255 }).notNull(),
  days: integer("days").notNull(),
  rent_per_day: decimal("rent_per_day", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatus("status").notNull().default("booked"),
  created_at: timestamp("created_at").notNull().defaultNow(),
})
