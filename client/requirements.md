## Packages
leaflet | Core mapping library
react-leaflet | React components for Leaflet
@types/leaflet | TypeScript definitions for Leaflet
framer-motion | For smooth UI transitions and animations
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}

Integration assumptions:
- Map tiles will be provided by OpenStreetMap (free, no key needed for basic usage).
- Leaflet CSS needs to be imported in index.css or App.tsx.
- Images for trees will use the static URLs provided in the prompt where available, or Unsplash placeholders for others.
