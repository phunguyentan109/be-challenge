import amqp, { Channel, ChannelModel } from 'amqplib';
import { rabbitmqConfig } from '../config/rabbitmq';

type MediaField = 'image' | 'trailerVideo';

export interface MediaUploadJob {
  movieId: string;
  field: MediaField;
  resourceType: 'image' | 'video';
  file: {
    buffer: string;
    mimetype: string;
    originalname: string;
    size: number;
  };
}

export class MediaUploadService {
  private connection?: ChannelModel;
  private channel?: Channel;

  async publish(job: MediaUploadJob) {
    const channel = await this.getChannel();
    const accepted = channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(job)), {
      contentType: 'application/json',
      deliveryMode: 2,
    });

    if (!accepted) {
      await new Promise((resolve) => channel.once('drain', resolve));
    }
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private get queueName() {
    return rabbitmqConfig.mediaUploadQueue;
  }

  private async getChannel() {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(rabbitmqConfig.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });

    return this.channel;
  }
}
