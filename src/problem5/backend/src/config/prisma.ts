import { PrismaClient } from '@prisma/client';
import './env';

const prisma = new PrismaClient();

export default prisma;
