import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
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
      const { landAreaSqm, barangayId } = api.trees.recommend.input.parse(
        req.body,
      );

      const barangay = await storage.getBarangay(barangayId);
      if (!barangay) {
        return res.status(404).json({ message: "Barangay not found" });
      }

      const isFloodProne =
        barangay.floodRisk === "High" || barangay.floodRisk === "Medium";
      const isUrban = barangay.urbanDensity === "High";

      const estimatedTrees = Math.floor(landAreaSqm / 15);
      const maxTrees = Math.max(1, estimatedTrees);

      const recommendedTrees = await storage.getRecommendedTrees(
        { floodResilient: isFloodProne, urbanSuitable: isUrban },
        landAreaSqm,
      );

      const validTrees = recommendedTrees.filter(
        (t) => t.minAreaSqm <= landAreaSqm,
      );

      res.json({
        recommendedTrees: validTrees,
        maxTrees,
        barangay,
        constraints: {
          floodRisk: barangay.floodRisk,
          urbanDensity: barangay.urbanDensity,
        },
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

    const barangayData = [
      { name: "Barangay 1", lat: 13.9419, lng: 121.1568, pop: 4061 },
      { name: "Barangay 2", lat: 13.9436, lng: 121.1581, pop: 3653 },
      { name: "Barangay 3", lat: 13.9439, lng: 121.1608, pop: 1921 },
      { name: "Barangay 4", lat: 13.9417, lng: 121.1604, pop: 587 },
      { name: "Barangay 5", lat: 13.9425, lng: 121.1623, pop: 636 },
      { name: "Barangay 6", lat: 13.9388, lng: 121.1623, pop: 645 },
      { name: "Barangay 7", lat: 13.9342, lng: 121.1596, pop: 5325 },
      { name: "Barangay 8", lat: 13.9391, lng: 121.1651, pop: 481 },
      { name: "Barangay 9", lat: 13.9428, lng: 121.1644, pop: 612 },
      { name: "Barangay 10", lat: 13.9418, lng: 121.169, pop: 3464 },
      { name: "Barangay 11", lat: 13.9406, lng: 121.1638, pop: 438 },
      { name: "Adya", lat: 13.8788, lng: 121.1395, pop: 2426 },
      { name: "Anilao", lat: 13.9048, lng: 121.1739, pop: 4954 },
      { name: "Anilao-Labac", lat: 13.8916, lng: 121.1858, pop: 4521 },
      { name: "Antipolo Del Norte", lat: 13.9285, lng: 121.1676, pop: 7028 },
      { name: "Antipolo Del Sur", lat: 13.914, lng: 121.1885, pop: 8612 },
      { name: "Bagong Pook", lat: 13.9423, lng: 121.1103, pop: 8188 },
      { name: "Balintawak", lat: 13.953, lng: 121.1588, pop: 22291 },
      { name: "Banaybanay", lat: 13.9328, lng: 121.1154, pop: 14998 },
      { name: "Bolbok", lat: 13.9245, lng: 121.1524, pop: 10217 },
      { name: "Bugtong na Pulo", lat: 14.0, lng: 121.167, pop: 8878 },
      { name: "Bulacnin", lat: 13.9911, lng: 121.1453, pop: 8521 },
      { name: "Bulaklakan", lat: 13.9417, lng: 121.0978, pop: 1855 },
      { name: "Calamias", lat: 13.8757, lng: 121.1524, pop: 1909 },
      { name: "Cumba", lat: 13.9069, lng: 121.1385, pop: 4371 },
      { name: "Dagatan", lat: 13.966, lng: 121.182, pop: 7909 },
      { name: "Duhatan", lat: 13.9339, lng: 121.0765, pop: 2982 },
      { name: "Fernando Air Base", lat: 13.955, lng: 121.125, pop: 1930 },
      { name: "Halang", lat: 13.9493, lng: 121.0765, pop: 2621 },
      { name: "Inosluban", lat: 13.9908, lng: 121.1653, pop: 17234 },
      { name: "Kayumanggi", lat: 13.9259, lng: 121.161, pop: 8961 },
      { name: "Latag", lat: 13.9348, lng: 121.1796, pop: 10828 },
      { name: "Lodlod", lat: 13.9345, lng: 121.1453, pop: 11570 },
      { name: "Lumbang", lat: 13.9837, lng: 121.1968, pop: 5421 },
      { name: "Mabini", lat: 13.8999, lng: 121.1539, pop: 6667 },
      { name: "Malagonlong", lat: 13.9116, lng: 121.1564, pop: 3084 },
      { name: "Malitlit", lat: 13.9399, lng: 121.234, pop: 2921 },
      { name: "Marauoy", lat: 13.96, lng: 121.17, pop: 21732 },
      { name: "Mataas na Lupa", lat: 13.9425, lng: 121.1524, pop: 5215 },
      { name: "Munting Pulo", lat: 13.9519, lng: 121.185, pop: 5612 },
      { name: "Pagolingin Bata", lat: 13.8927, lng: 121.1623, pop: 1429 },
      { name: "Pagolingin East", lat: 13.8832, lng: 121.1762, pop: 2518 },
      { name: "Pagolingin West", lat: 13.8754, lng: 121.1707, pop: 2407 },
      { name: "Pangao", lat: 13.9215, lng: 121.1281, pop: 7595 },
      { name: "Pinagkawitan", lat: 13.9007, lng: 121.2025, pop: 9353 },
      { name: "Pinagtongulan", lat: 13.9307, lng: 121.0994, pop: 4397 },
      { name: "Plaridel", lat: 13.9997, lng: 121.1788, pop: 6246 },
      { name: "Pusil", lat: 13.9832, lng: 121.1553, pop: 2522 },
      { name: "Quezon", lat: 13.8899, lng: 121.1338, pop: 2207 },
      { name: "Rizal", lat: 13.8756, lng: 121.1624, pop: 3979 },
      { name: "Sabang", lat: 13.951, lng: 121.1739, pop: 25616 },
      { name: "Sampaguita", lat: 13.9129, lng: 121.1438, pop: 10785 },
      { name: "San Benito", lat: 13.9317, lng: 121.2179, pop: 5211 },
      { name: "San Carlos", lat: 13.9499, lng: 121.1453, pop: 8972 },
      { name: "San Celestino", lat: 13.9179, lng: 121.2249, pop: 2681 },
      { name: "San Francisco", lat: 13.8942, lng: 121.2483, pop: 3595 },
      { name: "San Guillermo", lat: 13.8932, lng: 121.156, pop: 2024 },
      { name: "San Isidro", lat: 13.9589, lng: 121.2039, pop: 7355 },
      { name: "San Jose", lat: 13.9443, lng: 121.1854, pop: 7922 },
      { name: "San Lucas", lat: 14.0181, lng: 121.1811, pop: 4895 },
      { name: "San Salvador", lat: 13.9729, lng: 121.1281, pop: 5069 },
      { name: "Sico", lat: 13.945, lng: 121.1312, pop: 6167 },
      { name: "Santo Niño", lat: 13.9621, lng: 121.2226, pop: 3866 },
      { name: "Santo Toribio", lat: 13.9037, lng: 121.2223, pop: 4163 },
      { name: "Talisay", lat: 13.9716, lng: 121.2045, pop: 6058 },
      { name: "Tambo", lat: 13.9497, lng: 121.1381, pop: 14537 },
      { name: "Tangob", lat: 13.9375, lng: 121.1968, pop: 3586 },
      { name: "Tanguay", lat: 13.9733, lng: 121.1403, pop: 5654 },
      { name: "Tibig", lat: 13.9602, lng: 121.1453, pop: 6145 },
      { name: "Tipacan", lat: 13.9142, lng: 121.2068, pop: 4252 },
    ];

    for (const b of barangayData) {
      await storage.createBarangay({
        name: b.name,
        latitude: b.lat,
        longitude: b.lng,
        population: b.pop,
        floodRisk: b.name.includes("Barangay") ? "High" : "Medium", // Target flood area
        urbanDensity: b.pop > 10000 ? "High" : "Medium",
      });
    }

    const commonTimeline = {
      seedling: "1-2 months",
      juvenile: "1-3 years",
      mature: "5+ years",
    };

    await storage.createTree({
      name: "Banaba",
      scientificName: "Lagerstroemia speciosa",
      description: "A deciduous tree known for its beautiful purple flowers.",
      imageUrl: "/images/banaba.jpg",
      minAreaSqm: 12,
      floodResilient: true,
      urbanSuitable: true,
      growthTimeline: commonTimeline,
    });

    await storage.createTree({
      name: "Narra",
      scientificName: "Pterocarpus indicus",
      description: "The national tree of the Philippines, strong and durable.",
      imageUrl: "/images/narra.jpg",
      minAreaSqm: 25,
      floodResilient: true,
      urbanSuitable: false,
      growthTimeline: { ...commonTimeline, mature: "10+ years" },
    });

    await storage.createTree({
      name: "Amaltas (Golden Shower)",
      scientificName: "Cassia fistula",
      description: "Famous for its hanging yellow flowers.",
      imageUrl: "/images/amaltas.jpg",
      minAreaSqm: 10,
      floodResilient: false,
      urbanSuitable: true,
      growthTimeline: commonTimeline,
    });

    await storage.createTree({
      name: "Dungon",
      scientificName: "Heritiera littoralis",
      description: "A sturdy tree found in coastal and brackish water areas.",
      imageUrl: "/images/dungon.jpg",
      minAreaSqm: 20,
      floodResilient: true,
      urbanSuitable: false,
      growthTimeline: commonTimeline,
    });

    await storage.createTree({
      name: "Bischofia javanica",
      scientificName: "Bischofia javanica",
      description: "A large evergreen tree with a dense crown.",
      imageUrl: "/images/bischofia.jpg",
      minAreaSqm: 18,
      floodResilient: true,
      urbanSuitable: true,
      growthTimeline: commonTimeline,
    });

    await storage.createTree({
      name: "Balinghasai",
      scientificName: "Buchanania arborescens",
      description: "A small to medium-sized tree found in secondary forests.",
      imageUrl: "/images/balinghasai.jpg",
      minAreaSqm: 10,
      floodResilient: false,
      urbanSuitable: true,
      growthTimeline: commonTimeline,
    });

    await storage.createTree({
      name: "Talisay",
      scientificName: "Terminalia catappa",
      description: "Known as Sea Almond, provides excellent shade.",
      imageUrl: "/images/talisay.jpg",
      minAreaSqm: 20,
      floodResilient: true,
      urbanSuitable: true,
      growthTimeline: commonTimeline,
    });

    await storage.createTree({
      name: "Banuyo",
      scientificName: "Wallaceodendron celebicum",
      description: "A salt-tolerant native tree great for erosion control.",
      imageUrl: "/images/banuyo.jpg",
      minAreaSqm: 25,
      floodResilient: true,
      urbanSuitable: true,
      growthTimeline: commonTimeline,
    });

    console.log("Seeding complete.");
  }

  return httpServer;
}
