import { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma';

export async function listAllPromptsRoute(app: FastifyInstance) {
  app.get('/prompts', async (_, reply) => {
    const prompts = await prisma.prompt.findMany();

    reply.send(prompts);
  });
}
