import express from 'express';

import Specialty from '../models/specialty';
import {
  getAllCauses,
  getCausesBySpecialtyId,
  createCause,
} from '../controllers/causes-controllers';
import { validateCauseInput } from '../validators/causes-validators';
import { validateIdParam } from '../middleware/validation-middleware';

const router = express.Router();

//unused
router.get('/', getAllCauses);

//used
router.get('/:sid', validateIdParam('sid', Specialty), getCausesBySpecialtyId);

//used
router.post('/', validateCauseInput, createCause);

export default router;
