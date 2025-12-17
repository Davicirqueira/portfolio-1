// Contact Form Types

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormState {
  data: ContactFormData;
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: Partial<ContactFormData>;
}

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}