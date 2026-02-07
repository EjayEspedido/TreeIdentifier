import { type Tree } from "@shared/schema";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Droplets, Building2, Ruler, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TreeCardProps {
  tree: Tree;
  index: number;
}

export function TreeCard({ tree, index }: TreeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <div className="group relative bg-card hover:bg-muted/30 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full">
            {/* Image Aspect Ratio Container */}
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted">
              <img
                src={tree.imageUrl}
                alt={tree.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium">View Growth Timeline &rarr;</span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                    {tree.name}
                  </h3>
                  <p className="text-xs text-muted-foreground italic font-medium">
                    {tree.scientificName}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {tree.description}
              </p>
              
              <div className="mt-auto flex gap-2 flex-wrap">
                {tree.floodResilient && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none gap-1 px-2 py-0.5">
                    <Droplets className="w-3 h-3" /> Flood Resilient
                  </Badge>
                )}
                {tree.urbanSuitable && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none gap-1 px-2 py-0.5">
                    <Building2 className="w-3 h-3" /> Urban Safe
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl bg-card border-none shadow-2xl overflow-hidden p-0 rounded-2xl">
          <div className="grid md:grid-cols-2 h-full">
            {/* Left: Image & Quick Stats */}
            <div className="relative h-64 md:h-full bg-muted">
              <img 
                src={tree.imageUrl} 
                alt={tree.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
              <div className="absolute bottom-4 left-4 right-4 md:hidden text-white">
                <h2 className="text-2xl font-bold font-display">{tree.name}</h2>
                <p className="italic opacity-90">{tree.scientificName}</p>
              </div>
            </div>

            {/* Right: Details & Timeline */}
            <div className="p-6 md:p-8 flex flex-col h-full max-h-[80vh] overflow-y-auto">
              <div className="hidden md:block mb-6">
                <h2 className="text-3xl font-bold font-display text-primary">{tree.name}</h2>
                <p className="text-lg text-muted-foreground italic font-serif">{tree.scientificName}</p>
              </div>

              <div className="space-y-6">
                <div className="prose prose-sm text-foreground/80">
                  <p>{tree.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                      <Ruler className="w-4 h-4" />
                      Min. Space
                    </div>
                    <p className="text-sm">{tree.minAreaSqm} m²</p>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                      <Clock className="w-4 h-4" />
                      Growth
                    </div>
                    <p className="text-sm">See below</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-foreground border-b border-border pb-2">Growth Timeline</h4>
                  <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                    {Object.entries(tree.growthTimeline).map(([stage, details], idx) => (
                      <div key={stage} className="relative">
                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-background shadow-sm" />
                        <h5 className="font-bold text-sm uppercase tracking-wide text-primary mb-1">
                          {stage}
                        </h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {String(details)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
