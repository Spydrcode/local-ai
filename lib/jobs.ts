import { Queue, Worker } from "bullmq";

const connection = {
  connection: {
    host: process.env.UPSTASH_REDIS_REST_URL,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
    port: 6379, // Upstash REST proxy, port is ignored
  },
};

export const jobQueue = new Queue("localai-jobs", connection);

// Example worker (to be expanded for real tasks)
export function startWorker() {
  new Worker(
    "localai-jobs",
    async (job) => {
      // TODO: Implement job processing logic
      return { ok: true };
    },
    connection
  );
}
