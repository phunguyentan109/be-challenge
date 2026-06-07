# Movie Backend

TypeScript Express API for managing movies with MongoDB, Prisma, and optional Cloudinary media uploads.

## Requirements

- Node.js 20+
- Yarn
- MongoDB connection string
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

Build and run production output:

```bash
yarn build
yarn start
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

Run the backend and MongoDB:

```bash
docker compose up --build
```

The dev compose file starts:

- `mongodb`: local MongoDB single-node replica set
- `mongo-init`: one-time replica set initialization
- `backend`: Express app with the source mounted for live reload

The backend container runs:

```bash
yarn prisma:generate && yarn prisma:push && yarn dev
```

This means Prisma client generation, schema sync, and TypeScript watch mode are handled inside Docker.

Useful commands:

```bash
docker compose logs -f backend
docker compose down
docker compose down -v
```

`docker compose down -v` also removes the MongoDB volume.

### Docker Production Build

Build the production image:

```bash
docker build --target prod -t movie-backend .
```

Run it with an external MongoDB connection:

```bash
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL="mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority" \
  -e CLOUDINARY_CLOUD_NAME="your-cloud-name" \
  -e CLOUDINARY_API_KEY="your-api-key" \
  -e CLOUDINARY_API_SECRET="your-api-secret" \
  movie-backend
```

You can also run the production compose file:

```bash
docker compose -f docker-compose.prod.yml up --build
```

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
  config/          Prisma and Cloudinary clients
  controllers/     HTTP request and response handling
  middleware/      Error and not-found handlers
  repositories/    Database access through Prisma
  routes/          Express route definitions
  services/        Business logic and Cloudinary upload flow
  types/           Shared TypeScript interfaces
  utils/           Validation and error helpers
  validations/     Resource-specific request validation
```
