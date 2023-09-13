import fastify from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { createTranscriptionRoute } from './routes/create-transcription';
import { listAllPromptsRoute } from './routes/list-all-prompts';
import { uploadVideoRoute } from './routes/upload-video';
import { generateAICompletionRoute } from './routes/generate-ai-completion';

const app = fastify();

app.register(fastifyCors, {
  origin: '*',
});

app.register(generateAICompletionRoute);
app.register(createTranscriptionRoute);
app.register(listAllPromptsRoute);
app.register(uploadVideoRoute);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running on port 3333');
});
