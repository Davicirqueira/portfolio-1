/**
 * **Feature: admin-dashboard, Property 3: Content Validation Uniformity**
 * **Validates: Requirements 2.2, 4.3, 6.2, 8.2, 9.2, 10.2**
 * 
 * Property: For any content modification across all sections (Home, About, Experience, 
 * Projects, Statistics, Testimonials, Contact), the system should validate required 
 * fields and data formats before allowing save operations
 */

import fc from 'fast-check'
import { createZodValidator } from '@/lib/utils/validation'
import {
  homeSchema,
  aboutSchema,
  contactInfoSchema,
} from '@/lib/schemas/admin'

describe('Content Validation Uniformity Property', () => {
  // Testa que a validação é consistente para dados válidos
  it('should consistently validate valid data across sections', () => {
    // Dados válidos para Home
    const validHomeData = {
      name: 'João Silva',
      title: 'Desenvolvedor Full Stack',
      description: 'Desenvolvedor experiente com foco em tecnologias modernas',
      ctaButtons: [{ text: 'Contato', href: '/contato', variant: 'primary' as const }],
      profileImage: 'https://example.com/image.jpg',
    }

    // Dados válidos para About
    const validAboutData = {
      presentationText: 'Sou um desenvolvedor apaixonado por tecnologia com mais de 5 anos de experiência',
      profileImage: 'https://example.com/profile.jpg',
      educationButton: { text: 'Ver Formação', modalId: 'education-modal' },
    }

    // Dados válidos para Contact
    const validContactData = {
      email: 'joao@example.com',
      phone: '+5511999999999',
      location: 'São Paulo, SP',
      socialMedia: [
        { platform: 'linkedin' as const, url: 'https://linkedin.com/in/joao', label: 'LinkedIn' }
      ],
    }

    const testCases = [
      { name: 'Home', schema: homeSchema, data: validHomeData },
      { name: 'About', schema: aboutSchema, data: validAboutData },
      { name: 'Contact', schema: contactInfoSchema, data: validContactData },
    ]

    testCases.forEach(({ name, schema, data }) => {
      const validator = createZodValidator(schema)
      const result = validator(data)
      
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })

  // Testa que campos obrigatórios são sempre validados
  it('should consistently reject missing required fields across sections', () => {
    // Home sem campo obrigatório 'name'
    const invalidHomeData = {
      title: 'Desenvolvedor',
      description: 'Descrição válida',
    }

    // About sem campo obrigatório 'presentationText'
    const invalidAboutData = {
      profileImage: 'https://example.com/image.jpg',
    }

    // Contact sem campo obrigatório 'email'
    const invalidContactData = {
      phone: '+5511999999999',
      location: 'São Paulo',
    }

    const testCases = [
      { name: 'Home', schema: homeSchema, data: invalidHomeData },
      { name: 'About', schema: aboutSchema, data: invalidAboutData },
      { name: 'Contact', schema: contactInfoSchema, data: invalidContactData },
    ]

    testCases.forEach(({ name, schema, data }) => {
      const validator = createZodValidator(schema)
      const result = validator(data)
      
      expect(result.isValid).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })

  // Testa que formatos inválidos são rejeitados consistentemente
  it('should consistently reject invalid data formats across sections', () => {
    // Email inválido
    const invalidEmailData = {
      email: 'email-invalido',
      phone: '+5511999999999',
    }

    // URL inválida
    const invalidUrlData = {
      name: 'João Silva',
      title: 'Desenvolvedor',
      description: 'Descrição válida',
      profileImage: 'url-invalida',
    }

    const emailValidator = createZodValidator(contactInfoSchema)
    const emailResult = emailValidator(invalidEmailData)
    expect(emailResult.isValid).toBe(false)

    const urlValidator = createZodValidator(homeSchema)
    const urlResult = urlValidator(invalidUrlData)
    expect(urlResult.isValid).toBe(false)
  })

  // Testa que limites de tamanho são respeitados
  it('should consistently enforce field length limits across sections', () => {
    // Nome muito longo (> 100 caracteres)
    const longNameData = {
      name: 'a'.repeat(101),
      title: 'Desenvolvedor',
      description: 'Descrição válida',
    }

    // Texto de apresentação muito curto (< 50 caracteres)
    const shortTextData = {
      presentationText: 'Texto curto',
    }

    const nameValidator = createZodValidator(homeSchema)
    const nameResult = nameValidator(longNameData)
    expect(nameResult.isValid).toBe(false)

    const textValidator = createZodValidator(aboutSchema)
    const textResult = textValidator(shortTextData)
    expect(textResult.isValid).toBe(false)
  })

  // Property-based test para validação uniforme
  it('should apply validation rules uniformly using property-based testing', () => {
    // Generator para strings de tamanho específico
    const stringOfLength = (min: number, max: number) =>
      fc.string({ minLength: min, maxLength: max })

    // Testa que strings dentro dos limites sempre passam
    fc.assert(
      fc.property(
        stringOfLength(2, 100), // Nome válido
        stringOfLength(2, 200), // Título válido
        stringOfLength(10, 500), // Descrição válida
        (name, title, description) => {
          const data = { name, title, description }
          const validator = createZodValidator(homeSchema)
          const result = validator(data)
          
          // Se todos os campos estão dentro dos limites, deve ser válido
          expect(result.isValid).toBe(true)
        }
      ),
      { numRuns: 50 }
    )

    // Testa que strings fora dos limites sempre falham
    fc.assert(
      fc.property(
        stringOfLength(101, 200), // Nome inválido (muito longo)
        stringOfLength(2, 200),   // Título válido
        stringOfLength(10, 500),  // Descrição válida
        (name, title, description) => {
          const data = { name, title, description }
          const validator = createZodValidator(homeSchema)
          const result = validator(data)
          
          // Nome muito longo deve falhar
          expect(result.isValid).toBe(false)
        }
      ),
      { numRuns: 30 }
    )
  })
})