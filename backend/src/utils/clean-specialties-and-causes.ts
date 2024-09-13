import Specialty from '../models/specialty';
import Cause from '../models/cause';
import Doctor from '../models/doctor';
import { HttpError } from '../models/http-error';

/**
 * Utility function to clean up unused specialties and causes after modifying the doctors collection.
 */
export const cleanSpecialtiesAndCauses = async () => {
  try {
    const specialties = await Specialty.find();
    const causes = await Cause.find();

    const doctors = await Doctor.find();

    const usedSpecialtyIds = new Set(
      doctors.map((doctor) => doctor.specialtyId.toString())
    );
    const usedCauseIds = new Set(
      doctors.flatMap((doctor) =>
        doctor.causes.map((cause) => cause.toString())
      )
    );

    const unusedSpecialties = specialties.filter(
      (specialty) => !usedSpecialtyIds.has(specialty._id.toString())
    );
    const unusedCauses = causes.filter(
      (cause) => !usedCauseIds.has(cause._id.toString())
    );

    for (const specialty of unusedSpecialties) {
      await Specialty.findByIdAndDelete(specialty._id);
    }

    for (const cause of unusedCauses) {
      await Cause.findByIdAndDelete(cause._id);
    }

    console.log('Unused specialties and causes have been deleted.');
  } catch (err) {
    console.error(err);
    throw new HttpError(
      'Error occurred while cleaning specialties and causes.',
      500
    );
  }
};
