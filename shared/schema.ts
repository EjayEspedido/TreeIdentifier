import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === Barangays Table ===
export const barangays = pgTable("barangays", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  population: integer("population").notNull(),
  floodRisk: text("flood_risk").notNull(), // 'High', 'Medium', 'Low'
  urbanDensity: text("urban_density").notNull(), // 'High', 'Medium', 'Low'
});

// === Trees Table ===
export const trees = pgTable("trees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  minAreaSqm: real("min_area_sqm").notNull(), // Minimum space needed per tree
  floodResilient: boolean("flood_resilient").default(false),
  urbanSuitable: boolean("urban_suitable").default(false),
  growthTimeline: jsonb("growth_timeline").$type<{
    seedling: string;
    juvenile: string;
    mature: string;
  }>().notNull(),
});

// === Schemas ===
export const insertBarangaySchema = createInsertSchema(barangays);
export const insertTreeSchema = createInsertSchema(trees);

// === Types ===
export type Barangay = typeof barangays.$inferSelect;
export type Tree = typeof trees.$inferSelect;

export type InsertBarangay = z.infer<typeof insertBarangaySchema>;
export type InsertTree = z.infer<typeof insertTreeSchema>;

export interface TreeRecommendationRequest {
  landAreaSqm: number;
  barangayId: number;
}

export interface TreeRecommendationResponse {
  recommendedTrees: Tree[];
  maxTrees: number;
  barangay: Barangay;
  constraints: {
    floodRisk: string;
    urbanDensity: string;
  };
}
