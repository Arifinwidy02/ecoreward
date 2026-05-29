import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email wajib diisi')
    .email('Format email tidak valid')
    .trim()
    .lowercase(),
  password: yup
    .string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
