import { z } from 'zod';

// Personal Info Schema
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(100, 'Título muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  location: z.string().min(2, 'Localização deve ter pelo menos 2 caracteres'),
  avatar: z.string().url('URL do avatar inválida').optional(),
});

// Project Schema
export const projectSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(100, 'Título muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(200, 'Descrição muito longa'),
  longDescription: z.string().max(1000, 'Descrição longa muito extensa').optional(),
  technologies: z.array(z.string()).min(1, 'Pelo menos uma tecnologia é obrigatória'),
  githubUrl: z.string().url('URL do GitHub inválida').optional(),
  demoUrl: z.string().url('URL da demo inválida').optional(),
  imageUrl: z.string().url('URL da imagem inválida').optional(),
  featured: z.boolean(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  completedAt: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inválida'),
});

// Experience Schema
export const experienceSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  company: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  period: z.string().min(1, 'Período é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida').optional(),
});

// Education Schema
export const educationSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  institution: z.string().min(2, 'Nome da instituição deve ter pelo menos 2 caracteres'),
  degree: z.string().min(2, 'Grau deve ter pelo menos 2 caracteres'),
  field: z.string().min(2, 'Área de estudo deve ter pelo menos 2 caracteres'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  gpa: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  verificationUrl: z.string().url('URL de verificação inválida').optional(),
});

// Testimonial Schema
export const testimonialSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  company: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres').max(500, 'Conteúdo muito longo'),
  avatar: z.string().url('URL do avatar inválida').optional(),
  linkedinUrl: z.string().url('URL do LinkedIn inválida').optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inválida'),
});

// Social Links Schema
export const socialLinksSchema = z.object({
  github: z.string().url('URL do GitHub inválida').optional(),
  linkedin: z.string().url('URL do LinkedIn inválida').optional(),
  twitter: z.string().url('URL do Twitter inválida').optional(),
  website: z.string().url('URL do website inválida').optional(),
});

// SEO Config Schema
export const seoConfigSchema = z.object({
  title: z.string().min(10, 'Título SEO deve ter pelo menos 10 caracteres').max(60, 'Título SEO muito longo'),
  description: z.string().min(50, 'Descrição SEO deve ter pelo menos 50 caracteres').max(160, 'Descrição SEO muito longa'),
  keywords: z.array(z.string()).min(3, 'Pelo menos 3 palavras-chave são obrigatórias'),
  ogImage: z.string().url('URL da imagem OG inválida').optional(),
  twitterHandle: z.string().regex(/^@\w+$/, 'Handle do Twitter inválido').optional(),
});

// Complete Portfolio Config Schema
export const portfolioConfigSchema = z.object({
  personal: personalInfoSchema,
  about: z.string().min(50, 'Sobre deve ter pelo menos 50 caracteres').max(1000, 'Sobre muito longo'),
  skills: z.array(z.string()).min(3, 'Pelo menos 3 habilidades são obrigatórias'),
  projects: z.array(projectSchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  testimonials: z.array(testimonialSchema),
  social: socialLinksSchema,
  seo: seoConfigSchema,
});

// Export types inferred from schemas
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
export type SEOConfigInput = z.infer<typeof seoConfigSchema>;
export type PortfolioConfigInput = z.infer<typeof portfolioConfigSchema>;