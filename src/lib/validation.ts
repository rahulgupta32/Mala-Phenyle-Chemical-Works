import { z } from 'zod';
import { Role, ProductStatus } from '@prisma/client';
import { NEPAL_PROVINCES, ALL_DISTRICTS } from './constants';

// 1. Auth Validation
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[0-9\s\-]+$/, 'Invalid phone number format'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// 2. Shipping Address Validation
export const AddressSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').regex(/^\+?[0-9\s\-]+$/, 'Invalid mobile number'),
  province: z.enum(NEPAL_PROVINCES, { message: 'Please select a valid Province' }),
  district: z.string().refine((d) => ALL_DISTRICTS.includes(d), { message: 'Please select a valid District' }),
  municipality: z.string().min(2, 'Municipality/Rural Municipality is required'),
  ward: z.string().min(1, 'Ward number is required').regex(/^[0-9]+$/, 'Ward must be a number'),
  street: z.string().min(2, 'Street/Tole description is required'),
  landmark: z.string().optional(),
  googleMapsLink: z.string().url('Must be a valid URL').or(z.string().length(0)).optional(),
});

// 3. Product & Variant Validation
export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Size/Volume title is required (e.g. 1L, 5L)'),
  sku: z.string().min(3, 'SKU is required'),
  retailPrice: z.number().min(0, 'Retail price must be positive'),
  wholesalePrice: z.number().min(0, 'Wholesale price must be positive'),
  discountedPrice: z.number().min(0, 'Discounted price must be positive').nullable().optional(),
  stock: z.number().int().min(0, 'Stock must be at least 0'),
});

export const ProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(5, 'Short description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  retailPrice: z.number().min(0, 'Retail price must be positive'),
  wholesalePrice: z.number().min(0, 'Wholesale price must be positive'),
  discountedPrice: z.number().min(0, 'Discounted price must be positive').nullable().optional(),
  sku: z.string().min(3, 'Base SKU is required'),
  barcode: z.string().optional(),
  stock: z.number().int().min(0, 'Total stock must be at least 0'),
  lowStockThreshold: z.number().int().min(0, 'Threshold must be at least 0'),
  status: z.nativeEnum(ProductStatus),
  weightVolume: z.string().min(1, 'Default size is required (e.g. 1L)'),
  usageInstructions: z.string().optional(),
  safetyInstructions: z.string().optional(),
  ingredients: z.string().optional(),
  mfgDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  variants: z.array(ProductVariantSchema).optional(),
});

// 4. Order Checkout Validation (supports Guest Checkout)
export const CheckoutSchema = z.object({
  isGuest: z.boolean().default(false),
  guestName: z.string().min(2, 'Name is required').optional().or(z.literal('')),
  guestPhone: z.string().min(10, 'Phone is required').optional().or(z.literal('')),
  guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  addressId: z.string().optional(), // If registered, select existing address
  shippingAddress: AddressSchema.optional(), // If guest or new address
  paymentMethod: z.enum(['COD', 'ESEWA', 'KHALTI', 'BANK_TRANSFER', 'FONEPAY_QR']),
  notes: z.string().optional(),
});

// 5. Wholesale Registration Application
export const WholesaleApplicationSchema = z.object({
  companyName: z.string().min(3, 'Registered Company/Firm name is required'),
  panNumber: z.string().length(9, 'PAN/VAT number must be exactly 9 digits').regex(/^[0-9]+$/, 'PAN must contain only digits'),
  businessType: z.string().min(2, 'Please describe your business (e.g. Distributor, Retailer)'),
  documentUrl: z.string().optional(),
});
