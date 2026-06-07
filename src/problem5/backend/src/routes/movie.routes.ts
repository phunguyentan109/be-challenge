import { Router } from 'express';
import multer from 'multer';
import { MovieController } from '../controllers/movie.controller';
import { MovieRepository } from '../repositories/movie.repository';
import { CloudinaryService } from '../services/cloudinary.service';
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

const cloudinaryService = new CloudinaryService();
const movieService = new MovieService(movieRepository, cloudinaryService);

const movieController = new MovieController(movieService);

// Routes
const router = Router();

router.post('/', mediaUpload, movieController.create.bind(movieController));
router.get('/', movieController.list.bind(movieController));
router.get('/:id', movieController.getById.bind(movieController));
router.patch('/:id', mediaUpload, movieController.update.bind(movieController));
router.delete('/:id', movieController.delete.bind(movieController));

export default router;
