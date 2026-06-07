import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Movie Backend API',
      version: '1.0.0',
      description: 'CRUD API for movies with MongoDB, Prisma, Cloudinary uploads, filters, and cursor pagination.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local server',
      },
    ],
    tags: [
      {
        name: 'Movies',
        description: 'Movie collection endpoints',
      },
    ],
    components: {
      schemas: {
        Movie: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '665c1a88f8e2b7a3f6ec8271' },
            name: { type: 'string', example: 'Inception' },
            description: {
              type: 'string',
              example: 'A thief who steals corporate secrets through dream-sharing technology.',
            },
            rating: { type: 'number', format: 'float', minimum: 0, maximum: 10, example: 8.8 },
            image: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example: 'https://res.cloudinary.com/demo/image/upload/movie.jpg',
            },
            trailerVideo: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example: 'https://res.cloudinary.com/demo/video/upload/trailer.mp4',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateMovieJson: {
          type: 'object',
          required: ['name', 'description', 'rating'],
          properties: {
            name: { type: 'string', example: 'Inception' },
            description: {
              type: 'string',
              example: 'A thief who steals corporate secrets through dream-sharing technology.',
            },
            rating: { type: 'number', format: 'float', minimum: 0, maximum: 10, example: 8.8 },
            image: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/demo/image/upload/movie.jpg',
            },
            trailerVideo: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/demo/video/upload/trailer.mp4',
            },
          },
        },
        UpdateMovieJson: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Inception' },
            description: { type: 'string', example: 'Updated description' },
            rating: { type: 'number', format: 'float', minimum: 0, maximum: 10, example: 9.1 },
            image: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/demo/image/upload/movie-v2.jpg',
            },
            trailerVideo: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/demo/video/upload/trailer-v2.mp4',
            },
          },
        },
        MovieListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Movie' },
            },
            pageInfo: {
              type: 'object',
              properties: {
                hasNextPage: { type: 'boolean', example: true },
                nextCursor: {
                  type: 'string',
                  nullable: true,
                  format: 'date-time',
                  example: '2026-06-07T10:00:00.000Z',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Movie not found' },
          },
        },
      },
      parameters: {
        MovieId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          example: '665c1a88f8e2b7a3f6ec8271',
        },
      },
    },
  },
  apis: ['src/routes/*.ts', 'dist/routes/*.js'],
});
