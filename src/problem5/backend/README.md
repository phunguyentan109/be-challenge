# Movie Backend

TypeScript Express API for managing movies with MongoDB, Prisma, RabbitMQ, and asynchronous Cloudinary media uploads.

## Requirements

- Node.js 20+
- Yarn
- MongoDB connection string
- RabbitMQ
- Cloudinary account credentials

## Setup

```bash
yarn install
cp .env.example .env
```

Fill `.env`:

```env
PORT=3000
DATABASE_URL="mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
RABBITMQ_URL="amqp://localhost:5672"
MEDIA_UPLOAD_QUEUE="movie-media-upload"
MEDIA_UPLOAD_MAX_RETRIES=3
```

Generate Prisma client and sync the schema to MongoDB:

```bash
yarn prisma:generate
yarn prisma:push
```

## Run

```bash
yarn dev
```

Run the media upload worker in a second terminal:

```bash
yarn dev:worker
```

Build and run production output:

```bash
yarn build
yarn start
yarn start:worker
```

## Run With Docker

The project includes a multi-stage Dockerfile:

- `dev`: installs dependencies and runs the TypeScript dev server
- `build`: generates Prisma client and compiles TypeScript
- `prod`: runs the compiled JavaScript app with production dependencies

### Docker Compose Development

Create `.env` from the example and fill Cloudinary credentials if you want to test file uploads:

```bash
cp .env.example .env
```

Run the backend, worker, MongoDB, and RabbitMQ:

```bash
docker compose up --build
```

The dev compose file starts:

- `mongodb`: local MongoDB single-node replica set
- `mongo-init`: one-time replica set initialization
- `rabbitmq`: local RabbitMQ broker with management UI on `http://localhost:15672`
- `backend`: Express app with the source mounted for live reload
- `media-worker`: background worker that uploads queued image/video files to Cloudinary

The backend container runs:

```bash
yarn prisma:generate && yarn prisma:push && yarn dev
```

This means Prisma client generation, schema sync, and TypeScript watch mode are handled inside Docker.

Useful commands:

```bash
docker compose logs -f backend
docker compose logs -f media-worker
docker compose down
docker compose down -v
```

`docker compose down -v` also removes the MongoDB volume.

## API

Base URL:

```text
http://localhost:3000/api/movies
```

Swagger UI:

```text
http://localhost:3000/api-docs
```

OpenAPI JSON:

```text
http://localhost:3000/api-docs.json
```

## Project Structure

```text
src/
  config/          Prisma, RabbitMQ, and Cloudinary clients
  controllers/     HTTP request and response handling
  middleware/      Error and not-found handlers
  queues/          RabbitMQ publishing contracts
  repositories/    Database access through Prisma
  routes/          Express route definitions
  services/        Business logic
  types/           Shared TypeScript interfaces
  utils/           Validation and error helpers
  validations/     Resource-specific request validation
  workers/         Background media upload consumers
```
