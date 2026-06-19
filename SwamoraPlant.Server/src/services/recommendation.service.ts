/**
 * Maps a (plant, diseaseLabel) pair to a treatment recommendation.
 * Treatments and fertilizer guidance are sourced from the JSON files in
 * src/data so recommendations stay reviewable and easy to update.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PlantType } from '../ml/plant-types.js';

export interface TreatmentProduct {
  /** Brand or product name as sold locally (e.g. "Metalaxyl + Mancozeb", "Kumir"). */
  name: string;
  /** Container size, e.g. "1kg", "1L", "300g". */
  size: string;
  /** Indicative retail price in USD. */
  priceUsd: number;
}

export type FertilizerRecommendationStatus =
  | 'recommended'
  | 'conditional'
  | 'not_recommended';

export interface FertilizerRecommendation {
  status: FertilizerRecommendationStatus;
  /** Common fertilizer class or locally recognizable programme name. */
  name: string | null;
  nutrients: string[];
  guidance: string;
  caution: string;
  productKeywords: string[];
}

export interface Treatment {
  summary: string;
  medicine: string | null;
  /** Locally-available products with size + indicative USD price. */
  products: TreatmentProduct[];
  productKeywords: string[];
  /** Nutrition support shown separately so it is never confused with disease control. */
  fertilizer: FertilizerRecommendation;
}

type TreatmentRecord = Omit<Treatment, 'fertilizer'>;
type TreatmentsFile = Record<string, Record<string, TreatmentRecord>>;
type FertilizersFile = Record<
  string,
  Record<string, FertilizerRecommendation>
>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TREATMENTS_PATH = path.resolve(__dirname, '../data/treatments.json');
const FERTILIZERS_PATH = path.resolve(__dirname, '../data/fertilizers.json');

const treatments: TreatmentsFile = JSON.parse(
  fs.readFileSync(TREATMENTS_PATH, 'utf8'),
);
const fertilizers: FertilizersFile = JSON.parse(
  fs.readFileSync(FERTILIZERS_PATH, 'utf8'),
);

const FALLBACK_FERTILIZER: FertilizerRecommendation = {
  status: 'conditional',
  name: 'Soil-test-based balanced fertilizer',
  nutrients: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
  guidance:
    'Use fertilizer only when a soil test or local agronomist confirms a nutrient need.',
  caution:
    'Fertilizer may support crop growth, but it does not cure fungal, bacterial, viral, or pest damage.',
  productKeywords: ['balanced NPK fertilizer'],
};

const FALLBACK: TreatmentRecord = {
  summary:
    'No specific recommendation on file for this diagnosis. Consult a local agronomist.',
  medicine: null,
  products: [],
  productKeywords: [],
};

export const getTreatment = (plant: PlantType, label: string): Treatment => ({
  ...(treatments[plant]?.[label] ?? FALLBACK),
  fertilizer: fertilizers[plant]?.[label] ?? FALLBACK_FERTILIZER,
});
