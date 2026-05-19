/**
 * Maps a (plant, diseaseLabel) pair to a treatment recommendation.
 * Treatments are sourced from src/data/treatments.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PlantType } from '../ml/plant-types.js';

export interface Treatment {
  summary: string;
  medicine: string | null;
  productKeywords: string[];
}

type TreatmentsFile = Record<string, Record<string, Treatment>>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TREATMENTS_PATH = path.resolve(__dirname, '../data/treatments.json');

const treatments: TreatmentsFile = JSON.parse(
  fs.readFileSync(TREATMENTS_PATH, 'utf8'),
);

const FALLBACK: Treatment = {
  summary:
    'No specific recommendation on file for this diagnosis. Consult a local agronomist.',
  medicine: null,
  productKeywords: [],
};

export const getTreatment = (plant: PlantType, label: string): Treatment =>
  treatments[plant]?.[label] ?? FALLBACK;
