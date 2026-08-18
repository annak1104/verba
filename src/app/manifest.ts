import type {MetadataRoute} from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verba",
    short_name: "Verba",
    description: "A mobile-first English vocabulary learning app.",
    start_url: "/today",
    display: "standalone",
    background_color: "#f9f7f0",
    theme_color: "#5d7f36",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
