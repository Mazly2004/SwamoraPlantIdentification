import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { ImageUploadSchema, prepareImageForForwarding } from '../services/image.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const imageRouter = new OpenAPIHono();

imageRouter.use('/*', authMiddleware);

const uploadRoute = createRoute({
  method: 'post',
  path: '/upload',
  tags: ['Image'],
  summary: 'Upload a plant image',
  description: 'Accepts a plant image via multipart form-data and prepares it for downstream processing. Requires authentication.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: ImageUploadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            fileName: z.string(),
            size: z.number(),
            message: z.string(),
          }),
        },
      },
      description: 'Image received and prepared successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
      description: 'Invalid or missing file',
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
      description: 'Unauthorized — valid JWT required',
    },
  },
});

imageRouter.openapi(uploadRoute, async (c) => {
  const body = await c.req.parseBody();
  const file = body['image'];
  if (!(file instanceof File)) {
    return c.json({ error: 'No valid image file provided' }, 400);
  }
  const result = await prepareImageForForwarding(file);
  return c.json(result, 200);
});
