import '../config/env';
import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { rabbitmqConfig } from '../config/rabbitmq';
import { CloudinaryService } from '../services/cloudinary.service';
import { MediaUploadJob } from '../services/media-upload.service';
import { MovieRepository } from '../repositories/movie.repository';
import prisma from '../config/prisma';

const MAX_RETRIES = Number(process.env.MEDIA_UPLOAD_MAX_RETRIES || 3);

const cloudinaryService = new CloudinaryService();
const movieRepository = new MovieRepository();

const getRetryCount = (message: ConsumeMessage) => {
  const value = message.properties.headers?.['x-retry-count'];
  return typeof value === 'number' ? value : 0;
};

const parseJob = (message: ConsumeMessage): MediaUploadJob => JSON.parse(message.content.toString());

const getJobSummary = (job: MediaUploadJob) => ({
  movieId: job.movieId,
  field: job.field,
  resourceType: job.resourceType,
  originalname: job.file.originalname,
  mimetype: job.file.mimetype,
  size: job.file.size,
});

const toMulterFile = (job: MediaUploadJob): Express.Multer.File =>
  ({
    buffer: Buffer.from(job.file.buffer, 'base64'),
    mimetype: job.file.mimetype,
    originalname: job.file.originalname,
    size: job.file.size,
  }) as Express.Multer.File;

const requeueWithRetry = (channel: Channel, message: ConsumeMessage) => {
  const retryCount = getRetryCount(message);
  const job = parseJob(message);

  if (retryCount >= MAX_RETRIES) {
    console.error(`Media upload job failed after ${MAX_RETRIES} retries`, getJobSummary(job));
    channel.ack(message);
    return;
  }

  channel.sendToQueue(rabbitmqConfig.mediaUploadQueue, message.content, {
    contentType: 'application/json',
    deliveryMode: 2,
    headers: {
      ...message.properties.headers,
      'x-retry-count': retryCount + 1,
    },
  });
  channel.ack(message);
};

const processMessage = async (channel: Channel, message: ConsumeMessage) => {
  const job = parseJob(message);

  try {
    const url = await cloudinaryService.uploadFile(toMulterFile(job), job.resourceType);
    await movieRepository.update(job.movieId, { [job.field]: url });
    channel.ack(message);
  } catch (error) {
    console.error('Failed to process media upload job', getJobSummary(job), error);
    requeueWithRetry(channel, message);
  }
};

const start = async () => {
  const connection = await amqp.connect(rabbitmqConfig.url);
  const channel = await connection.createChannel();

  await channel.assertQueue(rabbitmqConfig.mediaUploadQueue, { durable: true });
  await channel.prefetch(1);
  await channel.consume(rabbitmqConfig.mediaUploadQueue, (message) => {
    if (!message) {
      return;
    }

    void processMessage(channel, message);
  });

  console.log(`Media upload worker consuming ${rabbitmqConfig.mediaUploadQueue}`);

  const shutdown = async () => {
    await channel.close();
    await connection.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch(async (error) => {
  console.error('Media upload worker failed to start', error);
  await prisma.$disconnect();
  process.exit(1);
});
