import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// ============================================
// BARANGAYS HOOKS
// ============================================

export function useBarangays() {
  return useQuery({
    queryKey: [api.barangays.list.path],
    queryFn: async () => {
      const res = await fetch(api.barangays.list.path);
      if (!res.ok) throw new Error("Failed to fetch barangays");
      return api.barangays.list.responses[200].parse(await res.json());
    },
  });
}

export function useNearestBarangay(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: [api.barangays.nearest.path, lat, lng],
    enabled: !!lat && !!lng,
    queryFn: async () => {
      if (!lat || !lng) return null;
      const url = buildUrl(api.barangays.nearest.path);
      const params = new URLSearchParams({ 
        lat: lat.toString(), 
        lng: lng.toString() 
      });
      
      const res = await fetch(`${url}?${params}`);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to find nearest barangay");
      }
      return api.barangays.nearest.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// TREES HOOKS
// ============================================

export function useTrees() {
  return useQuery({
    queryKey: [api.trees.list.path],
    queryFn: async () => {
      const res = await fetch(api.trees.list.path);
      if (!res.ok) throw new Error("Failed to fetch trees");
      return api.trees.list.responses[200].parse(await res.json());
    },
  });
}

export function useRecommendTrees() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.trees.recommend.input>) => {
      const res = await fetch(api.trees.recommend.path, {
        method: api.trees.recommend.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 404) {
          const error = api.trees.recommend.responses[404].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to get recommendations");
      }
      return api.trees.recommend.responses[200].parse(await res.json());
    },
  });
}
