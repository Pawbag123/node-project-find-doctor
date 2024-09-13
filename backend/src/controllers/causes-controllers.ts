import { RequestHandler } from 'express';

import Cause from '../models/cause';
import { HttpError } from '../models/http-error';

const getAllCauses: RequestHandler = async (req, res, next) => {
  let causes;

  try {
    causes = await Cause.find();
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Fetching causes failed, please try again.', 500)
    );
  }

  res.json({
    causes: causes.map((cause) => cause.toObject({ getters: true })),
  });
};

const getCausesBySpecialtyId: RequestHandler = async (req, res, next) => {
  const specialtyId = req.params.sid;

  let causes;

  try {
    causes = await Cause.find({ specialtyId });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError('Fetching causes failed, please try again.', 500)
    );
  }

  res.json({
    causes: causes.map((cause) => cause.toObject({ getters: true })),
  });
};

const createCause: RequestHandler = async (req, res, next) => {
  const { name, specialtyId } = req.body;

  let existingCause;
  try {
    existingCause = await Cause.findOne({ name, specialtyId });
  } catch (err) {
    console.error(err);
    return next(new HttpError('Creating cause failed, please try again.', 500));
  }

  if (existingCause) {
    return next(
      new HttpError(
        'Cause with this name already exists for the specified specialty.',
        422
      )
    );
  }

  const createdCause = new Cause({
    name,
    specialtyId,
  });

  try {
    await createdCause.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Creating cause failed, please try again.', 500));
  }

  res.status(201).json({ cause: createdCause.toObject({ getters: true }) });
};

export { getAllCauses, getCausesBySpecialtyId, createCause };
