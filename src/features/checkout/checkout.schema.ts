import { z } from 'zod'
export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name (at least 2 characters).')
    .max(100, 'Use 100 characters or fewer for your name.'),
  email: z
    .string()
    .trim()
    .max(254, 'Use 254 characters or fewer for your email.')
    .email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a phone number with at least 7 digits.')
    .max(30, 'Use 30 characters or fewer for your phone number.')
    .regex(/^[+\d\s().-]+$/, 'Use numbers and common phone symbols only.')
    .refine(
      (value) => value.replace(/\D/g, '').length >= 7,
      'Enter a phone number with at least 7 digits.',
    ),
  address: z
    .string()
    .trim()
    .min(8, 'Enter a shipping address (at least 8 characters).')
    .max(500, 'Use 500 characters or fewer for your address.'),
})
export type CheckoutValues = z.infer<typeof checkoutSchema>
