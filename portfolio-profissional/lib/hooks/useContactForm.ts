'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import { contactFormSchema, ContactFormData } from '@/lib/schemas/contact';
import { emailConfig } from '@/lib/config/email';

interface UseContactFormReturn {
  register: ReturnType<typeof useForm<ContactFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<ContactFormData>>['handleSubmit'];
  formState: ReturnType<typeof useForm<ContactFormData>>['formState'];
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submitForm: (data: ContactFormData) => Promise<void>;
  reset: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const submitForm = useCallback(async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Check for rate limiting (simple cooldown)
      const lastSubmission = localStorage.getItem('portfolio-contact-cooldown');
      if (lastSubmission) {
        const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
        const cooldownPeriod = 60000; // 1 minute cooldown
        
        if (timeSinceLastSubmission < cooldownPeriod) {
          const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastSubmission) / 1000);
          throw new Error(`Por favor, aguarde ${remainingTime} segundos antes de enviar outra mensagem.`);
        }
      }

      // Prepare email template parameters
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        to_name: 'Gilberto Nascimento',
        reply_to: data.email,
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        emailConfig.publicKey
      );

      if (response.status === 200) {
        setIsSuccess(true);
        form.reset();
        
        // Set cooldown
        localStorage.setItem('portfolio-contact-cooldown', Date.now().toString());
        
        // Track analytics (if implemented)
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'contact_form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form',
          });
        }
      } else {
        throw new Error('Falha ao enviar mensagem. Tente novamente.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  const reset = useCallback(() => {
    form.reset();
    setIsSuccess(false);
    setError(null);
    setIsSubmitting(false);
  }, [form]);

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
    isSubmitting,
    isSuccess,
    error,
    submitForm,
    reset,
  };
}