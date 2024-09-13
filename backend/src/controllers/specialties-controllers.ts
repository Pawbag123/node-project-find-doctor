import { RequestHandler } from 'express';

import Specialty from '../models/specialty';
import { HttpError } from '../models/http-error';

const getSpecialties: RequestHandler = async (req, res, next) => {
  let specialties;

  try {
    specialties = await Specialty.find();
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Fetching specialties failed, please try again later.', 500)
    );
  }

  res.json({
    specialties: specialties.map((specialty) =>
      specialty.toObject({ getters: true })
    ),
  });
};

const createSpecialty: RequestHandler = async (req, res, next) => {
  const { name } = req.body;

  let existingSpecialty;
  try {
    existingSpecialty = await Specialty.findOne({ name });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Creating specialty failed, please try again.', 500)
    );
  }

  if (existingSpecialty) {
    return next(new HttpError('Specialty with this name already exists.', 422));
  }

  const createdSpecialty = new Specialty({
    name,
  });

  try {
    await createdSpecialty.save();
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Creating specialty failed, please try again.', 500)
    );
  }
  res
    .status(201)
    .json({ specialty: createdSpecialty.toObject({ getters: true }) });
};

export { getSpecialties, createSpecialty };
