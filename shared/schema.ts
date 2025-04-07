import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  organization: text("organization"),
  role: text("role").default("user"), // Options: admin, uploader, user
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dataset model
export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull(),
  organizationId: integer("organization_id").notNull(),
  location: text("location"),
  category: text("category"),
  tags: text("tags").array(),
  format: text("format"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  downloadCount: integer("download_count").default(0),
  fileUrl: text("file_url"),
});

// Organization model
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  acronym: text("acronym"),
  description: text("description"),
  logoUrl: text("logo_url"),
  datasetCount: integer("dataset_count").default(0),
});

// Crisis model
export const crises = pgTable("crises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  datasetCount: integer("dataset_count").default(0),
});

// Statistics model
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  datasetCount: integer("dataset_count").default(0),
  organizationCount: integer("organization_count").default(0),
  locationCount: integer("location_count").default(0),
  activeCrisisCount: integer("active_crisis_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Visualization model
export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  source: text("source"),
  datasetId: integer("dataset_id"),
  visualizationType: text("visualization_type"),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  downloadCount: true,
  lastUpdated: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  datasetCount: true,
});

export const insertCrisisSchema = createInsertSchema(crises).omit({
  id: true,
  datasetCount: true,
});

export const insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
  lastUpdated: true,
});

export const insertVisualizationSchema = createInsertSchema(visualizations).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Crisis = typeof crises.$inferSelect;
export type InsertCrisis = z.infer<typeof insertCrisisSchema>;

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;

export type Visualization = typeof visualizations.$inferSelect;
export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
