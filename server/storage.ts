import { db } from "./db";
import { barangays, trees, type Barangay, type Tree, type InsertBarangay, type InsertTree } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Barangays
  getBarangays(): Promise<Barangay[]>;
  getBarangay(id: number): Promise<Barangay | undefined>;
  getNearestBarangay(lat: number, lng: number): Promise<Barangay | undefined>;
  createBarangay(barangay: InsertBarangay): Promise<Barangay>;

  // Trees
  getTrees(): Promise<Tree[]>;
  getRecommendedTrees(constraints: { floodResilient: boolean; urbanSuitable: boolean }, areaPerTree: number): Promise<Tree[]>;
  createTree(tree: InsertTree): Promise<Tree>;
  
  // Seed check
  hasData(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getBarangays(): Promise<Barangay[]> {
    return await db.select().from(barangays);
  }

  async getBarangay(id: number): Promise<Barangay | undefined> {
    const [barangay] = await db.select().from(barangays).where(eq(barangays.id, id));
    return barangay;
  }

  async getNearestBarangay(lat: number, lng: number): Promise<Barangay | undefined> {
    // Simple Euclidean distance for now since dataset is small. 
    // In production, use PostGIS: ORDER BY location <-> point($1, $2)
    const allBarangays = await this.getBarangays();
    if (allBarangays.length === 0) return undefined;

    let nearest = allBarangays[0];
    let minDist = Number.MAX_VALUE;

    for (const b of allBarangays) {
      const dist = Math.sqrt(Math.pow(b.latitude - lat, 2) + Math.pow(b.longitude - lng, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = b;
      }
    }
    return nearest;
  }

  async createBarangay(barangay: InsertBarangay): Promise<Barangay> {
    const [newBarangay] = await db.insert(barangays).values(barangay).returning();
    return newBarangay;
  }

  async getTrees(): Promise<Tree[]> {
    return await db.select().from(trees);
  }

  async getRecommendedTrees(constraints: { floodResilient: boolean; urbanSuitable: boolean }, areaPerTree: number): Promise<Tree[]> {
    // Filter in memory or query builder
    const allTrees = await this.getTrees();
    return allTrees.filter(tree => {
      // If area is too small for the tree, exclude
      if (areaPerTree < tree.minAreaSqm) return false;
      
      // If location is flood prone, tree must be flood resilient
      if (constraints.floodResilient && !tree.floodResilient) return false;

      // If location is urban (high density), tree should be urban suitable
      if (constraints.urbanSuitable && !tree.urbanSuitable) return false;

      return true;
    });
  }

  async createTree(tree: InsertTree): Promise<Tree> {
    const [newTree] = await db.insert(trees).values(tree).returning();
    return newTree;
  }

  async hasData(): Promise<boolean> {
    const [b] = await db.select().from(barangays).limit(1);
    const [t] = await db.select().from(trees).limit(1);
    return !!(b && t);
  }
}

export const storage = new DatabaseStorage();
