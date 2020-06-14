import Queue from 'bull';

const redis = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || '127.0.0.1',
};

export default function(queueName: string): Queue.Queue {
  return new Queue(queueName, `redis://${redis.host}:${redis.port}`);
}
