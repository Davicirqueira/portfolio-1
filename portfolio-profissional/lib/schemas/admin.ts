import { z } from 'zod'

// Schema para validação de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

// Schema para seção Home
export const homeSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  title: z
    .string()
    .min(2, 'Título deve ter pelo menos 2 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  ctaButtons: z.array(z.object({
    text: z.string().min(1, 'Texto do botão é obrigatório'),
    href: z.string().min(1, 'Link é obrigatório'),
    variant: z.enum(['primary', 'secondary', 'outline']).optional(),
  })).optional(),
  profileImage: z.string().url('URL da imagem inválida').optional(),
})

// Schema para seção About
export const aboutSchema = z.object({
  presentationText: z
    .string()
    .min(50, 'Texto de apresentação deve ter pelo menos 50 caracteres')
    .max(2000, 'Texto de apresentação deve ter no máximo 2000 caracteres'),
  profileImage: z.string().url('URL da imagem inválida').optional(),
  educationButton: z.object({
    text: z.string().min(1, 'Texto do botão é obrigatório'),
    modalId: z.string().optional(),
  }).optional(),
})

// Schema para experiência profissional
export const experienceSchema = z.object({
  position: z
    .string()
    .min(2, 'Cargo deve ter pelo menos 2 caracteres')
    .max(100, 'Cargo deve ter no máximo 100 caracteres'),
  company: z
    .string()
    .min(2, 'Empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Empresa deve ter no máximo 100 caracteres'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z
    .string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  responsibilities: z.array(z.string()).optional(),
})

// Schema para habilidades
export const skillSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da habilidade é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number().min(0).max(50),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  modalId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Schema para projetos
export const projectSchema = z.object({
  title: z
    .string()
    .min(2, 'Título deve ter pelo menos 2 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  description: z
    .string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  technologies: z.array(z.string()).min(1, 'Pelo menos uma tecnologia é obrigatória'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
  externalLinks: z.array(z.object({
    type: z.enum(['github', 'demo', 'documentation', 'other']),
    url: z.string().url('URL inválida'),
    label: z.string().optional(),
  })).optional(),
  modalId: z.string().optional(),
  isFeatured: z.boolean().optional(),
})

// Schema para estatísticas
export const statisticSchema = z.object({
  label: z
    .string()
    .min(1, 'Rótulo é obrigatório')
    .max(50, 'Rótulo deve ter no máximo 50 caracteres'),
  value: z.number().min(0, 'Valor deve ser positivo'),
  unit: z.string().max(20, 'Unidade deve ter no máximo 20 caracteres').optional(),
  description: z
    .string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional(),
  format: z.enum(['number', 'percentage', 'currency', 'duration']).optional(),
  order: z.number().optional(),
})

// Schema para depoimentos
export const testimonialSchema = z.object({
  clientName: z
    .string()
    .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  clientPosition: z
    .string()
    .min(2, 'Cargo deve ter pelo menos 2 caracteres')
    .max(100, 'Cargo deve ter no máximo 100 caracteres'),
  clientCompany: z
    .string()
    .min(2, 'Empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Empresa deve ter no máximo 100 caracteres'),
  testimonialText: z
    .string()
    .min(20, 'Depoimento deve ter pelo menos 20 caracteres')
    .max(1000, 'Depoimento deve ter no máximo 1000 caracteres'),
  initials: z.string().max(3, 'Iniciais devem ter no máximo 3 caracteres').optional(),
  rating: z.number().min(1).max(5).optional(),
  date: z.string().optional(),
})

// Schema para informações de contato
export const contactInfoSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Formato de telefone inválido')
    .optional(),
  location: z
    .string()
    .max(200, 'Localização deve ter no máximo 200 caracteres')
    .optional(),
  socialMedia: z.array(z.object({
    platform: z.enum(['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'other']),
    url: z.string().url('URL inválida'),
    label: z.string().optional(),
  })).optional(),
})

// Schema para modais dinâmicos
export const dynamicModalSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['education', 'skill', 'project']),
  title: z
    .string()
    .min(2, 'Título deve ter pelo menos 2 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z.record(z.any()), // Conteúdo flexível baseado no tipo
  isActive: z.boolean().optional(),
})

// Schema para formação acadêmica/profissional
export const educationSchema = z.object({
  institution: z
    .string()
    .min(2, 'Nome da instituição deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  degree: z
    .string()
    .min(2, 'Tipo de certificação deve ter pelo menos 2 caracteres')
    .max(200, 'Tipo deve ter no máximo 200 caracteres'),
  fieldOfStudy: z
    .string()
    .min(2, 'Área de estudo deve ter pelo menos 2 caracteres')
    .max(200, 'Área deve ter no máximo 200 caracteres'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  gpa: z.string().max(10, 'CRA deve ter no máximo 10 caracteres').optional(),
  achievements: z.array(z.string()).optional(),
})

// Schema para upload de imagem
export const imageUploadSchema = z.object({
  file: z.any(), // File object
  category: z.enum(['profile', 'project', 'general']),
  alt: z.string().max(200, 'Texto alternativo deve ter no máximo 200 caracteres').optional(),
})

// Tipos TypeScript inferidos dos schemas
export type LoginData = z.infer<typeof loginSchema>
export type HomeData = z.infer<typeof homeSchema>
export type AboutData = z.infer<typeof aboutSchema>
export type ExperienceData = z.infer<typeof experienceSchema>
export type SkillData = z.infer<typeof skillSchema>
export type ProjectData = z.infer<typeof projectSchema>
export type StatisticData = z.infer<typeof statisticSchema>
export type TestimonialData = z.infer<typeof testimonialSchema>
export type ContactInfoData = z.infer<typeof contactInfoSchema>
export type DynamicModalData = z.infer<typeof dynamicModalSchema>
export type EducationData = z.infer<typeof educationSchema>
export type ImageUploadData = z.infer<typeof imageUploadSchema>