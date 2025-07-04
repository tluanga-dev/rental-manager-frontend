import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Customer schemas based on backend business rules
export const customerBaseSchema = z.object({
  customer_type: z.enum(['INDIVIDUAL', 'BUSINESS']),
  customer_tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).default('BRONZE'),
  credit_limit: z.number().min(0, 'Credit limit must be positive').default(0),
});

export const individualCustomerSchema = customerBaseSchema.extend({
  customer_type: z.literal('INDIVIDUAL'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  business_name: z.string().optional(),
  tax_id: z.string().optional(),
});

export const businessCustomerSchema = customerBaseSchema.extend({
  customer_type: z.literal('BUSINESS'),
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  tax_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const customerSchema = z.discriminatedUnion('customer_type', [
  individualCustomerSchema,
  businessCustomerSchema,
]);

// Contact method schemas
export const contactMethodSchema = z.object({
  contact_type: z.enum(['MOBILE', 'EMAIL', 'PHONE', 'FAX']),
  contact_value: z.string().min(1, 'Contact value is required'),
  contact_label: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
  opt_in_marketing: z.boolean().optional().default(true),
}).refine((data) => {
  if (data.contact_type === 'EMAIL') {
    return z.string().email().safeParse(data.contact_value).success;
  }
  if (data.contact_type === 'MOBILE' || data.contact_type === 'PHONE') {
    return data.contact_value.length >= 10;
  }
  return true;
}, {
  message: 'Invalid contact value format',
  path: ['contact_value'],
});

// Address schemas
export const addressSchema = z.object({
  address_type: z.enum(['BILLING', 'SHIPPING', 'BOTH']),
  address_line1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postal_code: z.string().optional(),
  is_default: z.boolean().default(false),
});

// Contact person schemas (for business customers)
export const contactPersonMethodSchema = z.object({
  contact_type: z.enum(['MOBILE', 'EMAIL', 'PHONE', 'FAX']),
  contact_value: z.string().min(1, 'Contact value is required'),
  is_primary: z.boolean().default(false),
});

export const contactPersonSchema = z.object({
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  designation: z.string().optional(),
  department: z.string().optional(),
  is_primary: z.boolean().default(false),
  contact_methods: z.array(contactPersonMethodSchema).min(1, 'At least one contact method is required'),
});

// Complete customer creation schema
export const customerCreateSchema = z.object({
  customer: customerSchema,
  contact_methods: z.array(contactMethodSchema).min(1, 'At least one contact method is required'),
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
  contact_persons: z.array(contactPersonSchema).optional(),
}).refine((data) => {
  // Ensure at least one primary contact method
  const hasPrimaryContact = data.contact_methods.some(cm => cm.is_primary);
  if (!hasPrimaryContact && data.contact_methods.length > 0) {
    data.contact_methods[0].is_primary = true;
  }
  
  // Ensure at least one default address
  const hasDefaultAddress = data.addresses.some(addr => addr.is_default);
  if (!hasDefaultAddress && data.addresses.length > 0) {
    data.addresses[0].is_default = true;
  }
  
  // For business customers, contact persons are recommended
  if (data.customer.customer_type === 'BUSINESS' && (!data.contact_persons || data.contact_persons.length === 0)) {
    // This is just a warning, not an error
  }
  
  return true;
});

// Customer update schema - for updates, we make all fields optional
const individualCustomerUpdateSchema = customerBaseSchema.partial().extend({
  customer_type: z.literal('INDIVIDUAL').optional(),
  first_name: z.string().min(2, 'First name must be at least 2 characters').optional(),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  business_name: z.string().optional(),
  tax_id: z.string().optional(),
});

const businessCustomerUpdateSchema = customerBaseSchema.partial().extend({
  customer_type: z.literal('BUSINESS').optional(),
  business_name: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  tax_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const customerUpdateSchema = z.object({
  customer: z.union([individualCustomerUpdateSchema, businessCustomerUpdateSchema]),
  contact_methods: z.array(contactMethodSchema).optional(),
  addresses: z.array(addressSchema).optional(),
  contact_persons: z.array(contactPersonSchema).optional(),
});

// Customer search/filter schema
export const customerFilterSchema = z.object({
  search: z.string().optional(),
  customer_type: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
  customer_tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  is_active: z.boolean().optional(),
  blacklist_status: z.enum(['CLEAR', 'BLACKLISTED']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  min_lifetime_value: z.number().optional(),
  max_lifetime_value: z.number().optional(),
});


// Location schemas
export const locationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  location_type: z.enum(['STORE', 'WAREHOUSE']),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type CustomerCreateFormData = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateFormData = z.infer<typeof customerUpdateSchema>;
export type CustomerFilterFormData = z.infer<typeof customerFilterSchema>;
export type ContactMethodFormData = z.infer<typeof contactMethodSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ContactPersonFormData = z.infer<typeof contactPersonSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;