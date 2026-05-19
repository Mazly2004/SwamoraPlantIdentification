/**
 * Orchestrates the full diagnosis flow: classify image, look up treatment,
 * and (optionally) find nearby shops that stock the recommended product.
 */

import { classifyImage, type Prediction } from '../ml/inference.service.js';
import type { PlantType } from '../ml/plant-types.js';
import { getTreatment, type Treatment } from './recommendation.service.js';
import { findNearbyShops, type Shop, type ShopLocation } from './shops.service.js';

export interface DiagnosisRequest {
  plant: PlantType;
  image: Buffer;
  location?: ShopLocation;
}

export interface DiagnosisResult {
  plant: PlantType;
  topPrediction: Prediction;
  predictions: Prediction[];
  treatment: Treatment;
  shops: Shop[];
}

export const diagnose = async ({
  plant,
  image,
  location,
}: DiagnosisRequest): Promise<DiagnosisResult> => {
  const predictions = await classifyImage(plant, image, 3);
  const top = predictions[0];
  const treatment = getTreatment(plant, top.label);

  const shops =
    location && treatment.productKeywords.length > 0
      ? await findNearbyShops({
          location,
          productKeywords: treatment.productKeywords,
        })
      : [];

  return {
    plant,
    topPrediction: top,
    predictions,
    treatment,
    shops,
  };
};
