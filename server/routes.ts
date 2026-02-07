import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Barangays ===
  app.get(api.barangays.list.path, async (req, res) => {
    const barangays = await storage.getBarangays();
    res.json(barangays);
  });

  app.get(api.barangays.nearest.path, async (req, res) => {
    try {
      const { lat, lng } = api.barangays.nearest.input.parse(req.query);
      const nearest = await storage.getNearestBarangay(lat, lng);
      if (!nearest) {
        return res.status(404).json({ message: "No barangays found" });
      }
      res.json(nearest);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Trees Recommendation ===
  app.post(api.trees.recommend.path, async (req, res) => {
    try {
      const { landAreaSqm, barangayId } = api.trees.recommend.input.parse(req.body);
      
      const barangay = await storage.getBarangay(barangayId);
      if (!barangay) {
        return res.status(404).json({ message: "Barangay not found" });
      }

      // Constraints logic
      const isFloodProne = barangay.floodRisk === 'High' || barangay.floodRisk === 'Medium';
      const isUrban = barangay.urbanDensity === 'High';

      // Simple heuristic for max trees: 
      // Assume average tree needs ~10sqm (some need more, some less, but for quantity calc)
      // Or use minArea of specific trees.
      // Let's say we allocate 1 tree per 15sqm for healthy spacing by default
      const estimatedTrees = Math.floor(landAreaSqm / 15);
      const maxTrees = Math.max(1, estimatedTrees);

      const recommendedTrees = await storage.getRecommendedTrees(
        { floodResilient: isFloodProne, urbanSuitable: isUrban },
        landAreaSqm // pass total area? No, pass area per tree? 
        // Logic check: "Area (square meters)" and "Standard tree spacing rules".
        // Let's filter trees that *can* fit in the total area at least once.
      );

      // Refine filtering: A tree needs `minAreaSqm`. If `landAreaSqm` < `tree.minAreaSqm`, exclude it.
      // (This is handled in storage.getRecommendedTrees roughly, let's just update the call)
      // We'll pass the total area as the "limit" for a single tree, 
      // but usually recommendations are "you can plant N of these".
      
      // Update logic:
      // Filter trees where tree.minAreaSqm <= landAreaSqm.
      
      const validTrees = recommendedTrees.filter(t => t.minAreaSqm <= landAreaSqm);

      res.json({
        recommendedTrees: validTrees,
        maxTrees, 
        barangay,
        constraints: {
          floodRisk: barangay.floodRisk,
          urbanDensity: barangay.urbanDensity
        }
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.trees.list.path, async (req, res) => {
    const trees = await storage.getTrees();
    res.json(trees);
  });

  // === Seed Data ===
  const hasData = await storage.hasData();
  if (!hasData) {
    console.log("Seeding data...");
    
    // Seed Barangays (Sample Manila/QC locations)
    await storage.createBarangay({
      name: "Barangay San Antonio, Pasig",
      latitude: 14.5826,
      longitude: 121.0620,
      population: 20000,
      floodRisk: "Low",
      urbanDensity: "High"
    });
    await storage.createBarangay({
      name: "Barangay Tumana, Marikina",
      latitude: 14.6543,
      longitude: 121.0962,
      population: 45000,
      floodRisk: "High",
      urbanDensity: "High"
    });
     await storage.createBarangay({
      name: "Barangay UP Campus, Quezon City",
      latitude: 14.6537,
      longitude: 121.0685,
      population: 35000,
      floodRisk: "Low",
      urbanDensity: "Medium"
    });

    // Seed Trees
    const commonTimeline = { seedling: "1-2 months", juvenile: "1-3 years", mature: "5+ years" };
    
    await storage.createTree({
      name: "Banaba",
      scientificName: "Lagerstroemia speciosa",
      description: "A deciduous tree known for its beautiful purple flowers.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Lagerstroemia_speciosa_01.jpg/800px-Lagerstroemia_speciosa_01.jpg",
      minAreaSqm: 12,
      floodResilient: true,
      urbanSuitable: true,
      growthTimeline: commonTimeline
    });

    await storage.createTree({
      name: "Narra",
      scientificName: "Pterocarpus indicus",
      description: "The national tree of the Philippines, strong and durable.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Starr_080601-6577_Terminalia_catappa.jpg/800px-Starr_080601-6577_Terminalia_catappa.jpg", // Placeholder
      minAreaSqm: 25,
      floodResilient: true,
      urbanSuitable: false, // Large roots
      growthTimeline: { ...commonTimeline, mature: "10+ years" }
    });
    
    await storage.createTree({
      name: "Amaltas (Golden Shower)",
      scientificName: "Cassia fistula",
      description: "Famous for its hanging yellow flowers.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Cassia_fistula_-_Golden_Shower_Tree.jpg/800px-Cassia_fistula_-_Golden_Shower_Tree.jpg",
      minAreaSqm: 10,
      floodResilient: false,
      urbanSuitable: true,
      growthTimeline: commonTimeline
    });

    // Add more from the list...
    // Dungon, Bischofia, Balinghasai, Talisay, Banuyo
    // I'll add simplified versions for brevity in the seed
    
    await storage.createTree({
      name: "Talisay",
      scientificName: "Terminalia catappa",
      description: "Known as Sea Almond, provides excellent shade.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Starr_080601-6577_Terminalia_catappa.jpg/800px-Starr_080601-6577_Terminalia_catappa.jpg",
      minAreaSqm: 20,
      floodResilient: true,
      urbanSuitable: true,
      growthTimeline: commonTimeline
    });
    
    console.log("Seeding complete.");
  }

  return httpServer;
}
