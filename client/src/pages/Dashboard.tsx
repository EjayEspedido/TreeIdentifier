import { useState } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { MapController } from "@/components/MapController";
import { TreeCard } from "@/components/TreeCard";
import { useNearestBarangay, useRecommendTrees } from "@/hooks/use-eco-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MapPin,
  Trees,
  AlertTriangle,
  Droplets,
  Building2,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Default Center: Manila
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 };

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [landArea, setLandArea] = useState<string>("");

  // Queries
  const { data: barangay, isLoading: isLoadingBarangay } = useNearestBarangay(
    selectedLocation?.lat ?? null,
    selectedLocation?.lng ?? null,
  );

  const recommendMutation = useRecommendTrees();

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    recommendMutation.reset(); // Reset previous results
  };

  const handleAnalyze = () => {
    if (!barangay || !landArea) return;
    const area = parseFloat(landArea);
    if (isNaN(area) || area <= 0) return;

    recommendMutation.mutate({
      barangayId: barangay.id,
      landAreaSqm: area,
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* =======================
          SIDE PANEL
      ======================== */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-[450px] lg:w-[500px] h-[50vh] md:h-full flex flex-col bg-card border-r border-border z-20 shadow-2xl relative"
      >
        {/* Header */}
        <header className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Trees className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              EcoPlan
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            GIS-based environmental planning & reforestation tool.
          </p>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Location Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                1
              </span>
              Location Analysis
            </div>

            {!selectedLocation ? (
              <Card className="border-dashed border-2 bg-muted/20">
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                  <MapPin className="w-8 h-8 opacity-50" />
                  <p>Click anywhere on the map to analyze a location.</p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/30 rounded-xl p-4 border border-border"
              >
                {isLoadingBarangay ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching
                    location details...
                  </div>
                ) : barangay ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-bold text-xl text-primary">
                          {barangay.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">
                          {barangay.latitude.toFixed(4)},{" "}
                          {barangay.longitude.toFixed(4)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-background">
                        Pop: {barangay.population.toLocaleString()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-center font-medium
                        ${barangay.floodRisk === "High" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                      >
                        <Droplets className="w-4 h-4" />
                        Flood Risk: {barangay.floodRisk}
                      </div>
                      <div
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-center font-medium
                        ${barangay.urbanDensity === "High" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}
                      >
                        <Building2 className="w-4 h-4" />
                        Density: {barangay.urbanDensity}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Location not found.
                    Try elsewhere.
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <Separator />

          {/* STEP 2: Land Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                2
              </span>
              Site Parameters
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter land area..."
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="h-12 bg-background font-mono"
                  disabled={!barangay}
                />
              </div>
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!barangay || !landArea || recommendMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 h-12 px-6"
              >
                {recommendMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pl-1">
              * Enter area in square meters (m²)
            </p>
          </div>

          <Separator />

          {/* STEP 3: Results */}
          <AnimatePresence mode="wait">
            {recommendMutation.data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pb-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      3
                    </span>
                    Recommendations
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    Max Capacity: {recommendMutation.data.maxTrees} Trees
                  </Badge>
                </div>

                {recommendMutation.data.recommendedTrees.length === 0 ? (
                  <div className="p-6 bg-amber-50 rounded-xl text-amber-800 text-center text-sm">
                    No suitable trees found for these constraints. Try
                    increasing the land area.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {recommendMutation.data.recommendedTrees.map(
                      (tree, idx) => (
                        <TreeCard key={tree.id} tree={tree} index={idx} />
                      ),
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {recommendMutation.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {recommendMutation.error.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* =======================
          MAP AREA
      ======================== */}
      <main className="flex-1 h-[40vh] md:h-[70vh] relative bg-muted">
        <MapContainer
          center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={12}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          {/* Darker, cleaner map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />

          <MapController
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            selectedBarangay={barangay}
          />
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-border hidden md:block">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Map Legend
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span>Low Flood Risk</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>High Flood Risk</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Water Body</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
