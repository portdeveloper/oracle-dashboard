import { pgTable, text, integer, real, serial } from "drizzle-orm/pg-core";

export const oracleUpdates = pgTable("oracle_updates", {
  id: serial("id").primaryKey(),
  oracleName: text("oracle_name").notNull(),
  price: real("price").notNull(),
  updatedAt: integer("updated_at").notNull(), // oracle's timestamp
  recordedAt: integer("recorded_at").notNull(), // when we recorded it
  decimals: integer("decimals").notNull(),
  rawPrice: text("raw_price").notNull(),
});

export const oracleLatest = pgTable("oracle_latest", {
  oracleName: text("oracle_name").primaryKey(),
  price: real("price").notNull(),
  updatedAt: integer("updated_at").notNull(),
  recordedAt: integer("recorded_at").notNull(),
  decimals: integer("decimals").notNull(),
  rawPrice: text("raw_price").notNull(),
  lastChangeAt: integer("last_change_at"),
  updateCount: integer("update_count").default(0),
});
