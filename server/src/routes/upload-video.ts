import fastifyMultipart from '@fastify/multipart';
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { prisma } from '../lib/prisma';

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25 // 25mb
    },
  });

  app.post('/videos', async (request, reply) => {
    const data = await request.file();

    if(!data) {
      return reply.status(400).send('No file uploaded');
    }

    const extension = path.extname(data.filename)

    if(extension !== '.mp3') {
      return reply
        .status(400)
        .send('Only mp3 files are allowed');
    }

    const fileBaseName = path.basename(data.filename, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

    const uploadDestination =
      path.resolve(__dirname, '../../tmp', fileUploadName);

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      }
    })

    return reply.send({ video })
  });
}
