import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address.')
      .max(255, 'Email must not exceed 255 characters.')
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must not exceed 128 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one digit.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
    firstName: z
      .string({ required_error: 'First name is required.' })
      .min(1, 'First name is required.')
      .max(100, 'First name must not exceed 100 characters.')
      .trim(),
    lastName: z
      .string({ required_error: 'Last name is required.' })
      .min(1, 'Last name is required.')
      .max(100, 'Last name must not exceed 100 characters.')
      .trim(),
  }).strict(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address.')
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(1, 'Password is required.'),
  }).strict(),
});

export type RegisterBody = z.infer<typeof registerSchema>['body'];
export type LoginBody = z.infer<typeof loginSchema>['body'];
