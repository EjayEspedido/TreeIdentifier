import { z } from 'zod';
import { barangays, trees } from './schema';

export const api = {
  barangays: {
    list: {
      method: 'GET' as const,
      path: '/api/barangays' as const,
      responses: {
        200: z.array(z.custom<typeof barangays.$inferSelect>()),
      },
    },
    nearest: {
      method: 'GET' as const,
      path: '/api/barangays/nearest' as const,
      input: z.object({
        lat: z.coerce.number(),
        lng: z.coerce.number(),
      }),
      responses: {
        200: z.custom<typeof barangays.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  trees: {
    list: {
      method: 'GET' as const,
      path: '/api/trees' as const,
      responses: {
        200: z.array(z.custom<typeof trees.$inferSelect>()),
      },
    },
    recommend: {
      method: 'POST' as const,
      path: '/api/trees/recommend' as const,
      input: z.object({
        landAreaSqm: z.number().min(1),
        barangayId: z.number(),
      }),
      responses: {
        200: z.object({
          recommendedTrees: z.array(z.custom<typeof trees.$inferSelect>()),
          maxTrees: z.number(),
          barangay: z.custom<typeof barangays.$inferSelect>(),
          constraints: z.object({
            floodRisk: z.string(),
            urbanDensity: z.string(),
          }),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
