import { z } from 'zod';

export const billUploadSchema = z.object({
  type: z.enum(
    ['ENERGY', 'BROADBAND', 'MOBILE', 'WATER', 'COUNCIL_TAX', 'TV_LICENCE', 'OTHER'],
    {
      errorMap: () => ({
        message:
          'Invalid bill type. Must be one of: ENERGY, BROADBAND, MOBILE, WATER, COUNCIL_TAX, TV_LICENCE, OTHER',
      }),
    }
  ),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
