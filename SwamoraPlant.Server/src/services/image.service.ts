import { z } from '@hono/zod-openapi'; // Use the extended z from hono

export const ImageUploadSchema = z.object({
  image: z.instanceof(File).openapi({
    type: 'string',
    format: 'binary',
    description: 'The image file to upload',
  }),
});

/**
 * Validates and prepares the image for forwarding.
 * In a real-world scenario, you might upload it to S3 here,
 * or send it directly to another server.
 */
export const prepareImageForForwarding = async (file: File) => {
  // Extract buffer and metadata
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Here we would mock sending it to another server.
  // const formData = new FormData();
  // formData.append('image', new Blob([buffer]), file.name);
  // await fetch('https://other-server.com/upload', { method: 'POST', body: formData });
  
  console.log(`[Image Service] Prepared image: ${file.name} (${buffer.length} bytes)`);
  
  return {
    success: true,
    fileName: file.name,
    size: buffer.length,
    message: "Image prepared for forwarding successfully."
  };
};