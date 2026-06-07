import './config/env';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import movieRoutes from './routes/movie.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.json({
    message: 'Server is running',
    docs: '/api-docs',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_, res) => {
  res.json(swaggerSpec);
});

app.use('/api/movies', movieRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
