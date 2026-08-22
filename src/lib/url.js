export function placeFromUrl(search = window.location.search) {
  if (typeof search !== "string") return null;
  const params = new URLSearchParams(search);
  const lat = Number.parseFloat(params.get("lat"));
  const lon = Number.parseFloat(params.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return {
    id: `${lat.toFixed(3)},${lon.toFixed(3)}`,
    name: params.get("name") || "Shared location",
    country: params.get("country") || "",
    countryCode: "",
    admin: "",
    latitude: lat,
    longitude: lon,
  };
}

export function urlForPlace(
  place,
  origin = window.location.origin + window.location.pathname
) {
  const params = new URLSearchParams({
    lat: place.latitude.toFixed(4),
    lon: place.longitude.toFixed(4),
    name: place.name,
  });
  if (place.country) params.set("country", place.country);
  return `${origin}?${params.toString()}`;
}

export function syncUrl(place) {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  const params = new URLSearchParams({
    lat: place.latitude.toFixed(4),
    lon: place.longitude.toFixed(4),
    name: place.name,
  });
  if (place.country) params.set("country", place.country);
  try {
    window.history.replaceState(null, "", `?${params.toString()}`);
  } catch {
    // Sandboxed frames with an opaque origin reject history writes.
  }
}
