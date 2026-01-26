'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github, 
  Instagram, 
  Facebook, 
  Youtube,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ContactInfo } from '@/lib/types/portfolio';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Validation schema for contact information
const contactSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Formato de telefone inválido'),
  location: z.string()
    .min(1, 'Localização é obrigatória')
    .max(100, 'Localização deve ter no máximo 100 caracteres'),
  availability: z.string()
    .max(200, 'Status deve ter no máximo 200 caracteres')
    .optional(),
  preferredContact: z.enum(['email', 'phone', 'linkedin']).optional(),
  social: z.object({
    linkedin: z.string()
      .url('URL do LinkedIn inválida')
      .optional()
      .or(z.literal('')),
    twitter: z.string()
      .url('URL do Twitter inválida')
      .optional()
      .or(z.literal('')),
    github: z.string()
      .url('URL do GitHub inválida')
      .optional()
      .or(z.literal('')),
    instagram: z.string()
      .url('URL do Instagram inválida')
      .optional()
      .or(z.literal('')),
    facebook: z.string()
      .url('URL do Facebook inválida')
      .optional()
      .or(z.literal('')),
    youtube: z.string()
      .url('URL do YouTube inválida')
      .optional()
      .or(z.literal('')),
    website: z.string()
      .url('URL do website inválida')
      .optional()
      .or(z.literal(''))
  })
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactEditorProps {
  initialData?: ContactInfo;
  onSave: (data: ContactInfo) => Promise<void>;
  onCancel?: () => void;
}

const socialPlatforms = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { key: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  { key: 'github', label: 'GitHub', icon: Github, color: 'text-gray-800' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-700' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { key: 'website', label: 'Website', icon: Globe, color: 'text-green-600' }
] as const;

const preferredContactOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'linkedin', label: 'LinkedIn' }
];

export function ContactEditor({ initialData, onSave, onCancel }: ContactEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      location: initialData?.location || '',
      availability: initialData?.availability || '',
      preferredContact: initialData?.preferredContact || 'email',
      social: {
        linkedin: initialData?.social?.linkedin || '',
        twitter: initialData?.social?.twitter || '',
        github: initialData?.social?.github || '',
        instagram: initialData?.social?.instagram || '',
        facebook: initialData?.social?.facebook || '',
        youtube: initialData?.social?.youtube || '',
        website: initialData?.social?.website || ''
      }
    }
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        email: initialData.email,
        phone: initialData.phone,
        location: initialData.location,
        availability: initialData.availability || '',
        preferredContact: initialData.preferredContact || 'email',
        social: {
          linkedin: initialData.social?.linkedin || '',
          twitter: initialData.social?.twitter || '',
          github: initialData.social?.github || '',
          instagram: initialData.social?.instagram || '',
          facebook: initialData.social?.facebook || '',
          youtube: initialData.social?.youtube || '',
          website: initialData.social?.website || ''
        }
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      // Clean up empty social links
      const cleanedSocial = Object.fromEntries(
        Object.entries(data.social).filter(([_, value]) => value && value.trim() !== '')
      );

      const contactData: ContactInfo = {
        email: data.email,
        phone: data.phone,
        location: data.location,
        availability: data.availability || undefined,
        preferredContact: data.preferredContact,
        social: cleanedSocial
      };

      await onSave(contactData);
      setSaveStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar informações de contato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      reset();
    }
    onCancel?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Informações de Contato</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações de contato e redes sociais
          </p>
        </div>
        
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Salvo com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Contact Information */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            
            <Input
              label="Telefone"
              type="tel"
              placeholder="+55 (11) 99999-9999"
              error={errors.phone?.message}
              required
              {...register('phone')}
            />
          </div>

          <div className="mt-6">
            <Input
              label="Localização"
              placeholder="Cidade, Estado, País"
              error={errors.location?.message}
              required
              {...register('location')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Input
              label="Status de Disponibilidade"
              placeholder="Ex: Disponível para novos projetos"
              error={errors.availability?.message}
              {...register('availability')}
            />
            
            <Select
              label="Forma Preferida de Contato"
              options={preferredContactOptions}
              error={errors.preferredContact?.message}
              {...register('preferredContact')}
            />
          </div>
        </Card>

        {/* Social Media Links */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Redes Sociais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPlatforms.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", color)} />
                    {label}
                  </div>
                </label>
                <Input
                  type="url"
                  placeholder={`https://${key === 'website' ? 'seusite.com' : `${key}.com/seuusuario`}`}
                  error={errors.social?.[key as keyof typeof errors.social]?.message}
                  {...register(`social.${key}` as const)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Error Message */}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}