import type {MetadataRoute} from "next";
import ukMessages from "../../messages/uk.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Verba",
    short_name: "Verba",
    description: ukMessages.App.description,
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
