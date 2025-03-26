import { Loader } from "@googlemaps/js-api-loader";

let loader: Loader | null = null;

export const initGoogleMaps = () => {
  if (!loader) {
    loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
    });
  }
  return loader.load();
};

export const searchLocation = async (
  query: string,
): Promise<google.maps.places.PlaceResult[]> => {
  const google = await initGoogleMaps();

  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(
      document.createElement("div"),
    );

    service.textSearch({ query }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        reject(new Error("Location search failed"));
      }
    });
  });
};
