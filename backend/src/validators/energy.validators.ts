import { z } from 'zod';

const ukPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export const energyScanSchema = z.object({
  postcode: z
    .string()
    .trim()
    .regex(ukPostcode, 'Invalid UK postcode (e.g. SW1A 1AA)'),
  currentSupplier: z.string().trim().max(100).optional(),
  currentTariff: z.string().trim().max(200).optional(),
  annualUsageKwh: z.number().min(0).max(100_000).optional(),
});
