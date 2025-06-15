import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Define the validation schema using Zod
export const transferSchema = z.object({
  recipientName: z.string().min(8, 'Recipient full name is required'),
  recipientAccount: z
    .string()
    .refine(isValidPhoneNumber, { message: 'Please add a valid phone ' }),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

export type TransferPayload = z.infer<typeof transferSchema>;
