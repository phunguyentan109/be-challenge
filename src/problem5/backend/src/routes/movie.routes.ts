import { Router } from 'express';
import multer from 'multer';
import { MovieController } from '../controllers/movie.controller';
import { MovieRepository } from '../repositories/movie.repository';
import { MediaUploadService } from '../services/media-upload.service';
import { MovieService } from '../services/movie.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const mediaUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'trailerVideo', maxCount: 1 },
]);

// Dependencies Injection
const movieRepository = new MovieRepository();
const mediaUploadService = new MediaUploadService();
const movieService = new MovieService(movieRepository, mediaUploadService);

const movieController = new MovieController(movieService);

// Routes
const router = Router();

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Create a movie
 *     tags: [Movies]
 *     description: Creates a movie immediately and queues uploaded image/video files for asynchronous Cloudinary processing.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, rating]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Inception
 *               description:
 *                 type: string
 *                 example: A thief who steals corporate secrets through dream-sharing technology.
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 8.8
 *               image:
 *                 type: string
 *                 format: binary
 *               trailerVideo:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovieJson'
 *     responses:
 *       201:
 *         description: Movie created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', mediaUpload, movieController.create.bind(movieController));

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: List movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: createdFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: createdTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Movies list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieListResponse'
 */
router.get('/', movieController.list.bind(movieController));

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get a movie by id
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     responses:
 *       200:
 *         description: Movie found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', movieController.getById.bind(movieController));

/**
 * @swagger
 * /api/movies/{id}:
 *   patch:
 *     summary: Update a movie
 *     tags: [Movies]
 *     description: Updates text fields immediately and queues uploaded image/video files for asynchronous Cloudinary processing.
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Inception
 *               description:
 *                 type: string
 *                 example: Updated description
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 9.1
 *               image:
 *                 type: string
 *                 format: binary
 *               trailerVideo:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMovieJson'
 *     responses:
 *       200:
 *         description: Movie updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id', mediaUpload, movieController.update.bind(movieController));

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Delete a movie
 *     tags: [Movies]
 *     parameters:
 *       - $ref: '#/components/parameters/MovieId'
 *     responses:
 *       204:
 *         description: Movie deleted
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', movieController.delete.bind(movieController));

export default router;
