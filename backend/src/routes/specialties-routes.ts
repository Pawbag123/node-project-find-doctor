import express from 'express';

import {
  getSpecialties,
  createSpecialty,
} from '../controllers/specialties-controllers';
import { validateSpecialtyInput } from '../validators/specialties-validators';

const router = express.Router();

router.get('/', getSpecialties);

router.post('/', validateSpecialtyInput, createSpecialty);

export default router;
