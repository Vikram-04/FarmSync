// Crops with disease detection: crop name from the crops collection -> PlantVillage crop name.
const DISEASE_CROPS = {
  maize: "Corn_(maize)",
  grapes: "Grape",
  potato: "Potato",
  tomato: "Tomato",
};

export const plantVillageCrop = (cropName) =>
  DISEASE_CROPS[String(cropName).trim().toLowerCase()] || null;
