import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { diagnose } from '../services/diagnosis.service.js';
import { PLANT_TYPES, isPlantType } from '../ml/plant-types.js';

export const diagnoseRouter = new OpenAPIHono();

diagnoseRouter.use('/*', authMiddleware);

const PredictionSchema = z.object({
  label: z.string(),
  confidence: z.number(),
});

const TreatmentSchema = z.object({
  summary: z.string(),
  medicine: z.string().nullable(),
  productKeywords: z.array(z.string()),
});

const ShopSchema = z.object({
  name: z.string(),
  address: z.string(),
  location: z.object({ lat: z.number(), lng: z.number() }),
  distanceMeters: z.number().optional(),
  rating: z.number().optional(),
  mapsUrl: z.string(),
});

const DiagnoseResponseSchema = z.object({
  plant: z.enum(PLANT_TYPES),
  topPrediction: PredictionSchema,
  predictions: z.array(PredictionSchema),
  treatment: TreatmentSchema,
  shops: z.array(ShopSchema),
});

const diagnoseRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Diagnose'],
  summary: 'Diagnose a plant image',
  description:
    'Upload a plant image plus a plantType; the server runs the matching model and returns a diagnosis, treatment recommendation, and optionally nearby shops.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            image: z.instanceof(File).openapi({
              type: 'string',
              format: 'binary',
              description: 'Plant image file',
            }),
            plantType: z.enum(PLANT_TYPES).openapi({
              description: 'Which plant model to route the image to',
            }),
            lat: z
              .string()
              .optional()
              .openapi({ description: 'User latitude (for shop lookup)' }),
            lng: z
              .string()
              .optional()
              .openapi({ description: 'User longitude (for shop lookup)' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: DiagnoseResponseSchema } },
      description: 'Diagnosis result',
    },
    400: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Invalid request',
    },
    401: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Unauthorized',
    },
    500: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Inference failure',
    },
  },
});

const parseCoord = (raw: unknown): number | undefined => {
  if (typeof raw !== 'string' || raw.length === 0) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

diagnoseRouter.openapi(diagnoseRoute, async (c) => {
  const body = await c.req.parseBody();

  const file = body['image'];
  if (!(file instanceof File)) {
    return c.json({ error: 'No valid image file provided' }, 400);
  }

  const plantType = body['plantType'];
  if (!isPlantType(plantType)) {
    return c.json(
      { error: `plantType must be one of: ${PLANT_TYPES.join(', ')}` },
      400,
    );
  }

  const lat = parseCoord(body['lat']);
  const lng = parseCoord(body['lng']);
  const location = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

  try {
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const result = await diagnose({ plant: plantType, image: imageBuffer, location });
    return c.json(result, 200);
  } catch (err) {
    console.error('[diagnose] failed:', err);
    const message = err instanceof Error ? err.message : 'Diagnosis failed';
    return c.json({ error: message }, 500);
  }
});
