import './env';

export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  mediaUploadQueue: process.env.MEDIA_UPLOAD_QUEUE || 'movie-media-upload',
};
