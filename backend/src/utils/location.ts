import axios from 'axios';
import dotenv from 'dotenv';

import { HttpError } from '../models/http-error';

dotenv.config();

export const getCoordsForAddress = async (address: string) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`
  );

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Location not found', 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
};

export const calculateDistance = (
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
) => {
  const R = 6371;
  const dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
  const dLng = (coords2.lng - coords1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1.lat * (Math.PI / 180)) *
      Math.cos(coords2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
