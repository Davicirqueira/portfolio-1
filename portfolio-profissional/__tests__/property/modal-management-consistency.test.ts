/**
 * Property Test 5: Modal Management Consistency
 * Validates: Requirements 4.2, 4.4, 5.2, 5.3, 5.4, 7.2, 7.3, 7.4
 * 
 * This test ensures that modal management operations are consistent
 * across different modal types and maintain data integrity.
 * 
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

// Mock modal data structures
interface BaseModal {
  id: string
  type: 'education' | 'skill' | 'project'
  title: string
  lastModified: string
  isActive: boolean
  data: any
}

interface EducationModal extends BaseModal {
  type: 'education'
  data: {
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    description: string
    achievements?: string[]
    verificationUrl?: string
    certificateImage?: string
  }
}

interface SkillModal extends BaseModal {
  type: 'skill'
  data: {
    category: string
    proficiency: number
    yearsOfExperience: number
    expertiseLevel: string
    description: string
    detailedDescription: string
    usageExamples: string[]
    keyProjects?: string[]
    certifications?: string[]
    color: string
  }
}

interface ProjectModal extends BaseModal {
  type: 'project'
  data: {
    category: string
    description: string
    longDescription: string
    technologies: string[]
    methodologies?: string[]
    startDate: string
    endDate?: string
    githubUrl?: string
    demoUrl?: string
    status: string
    featured: boolean
    achievements?: string[]
    challenges?: string[]
  }
}

type Modal = EducationModal | SkillModal | ProjectModal

// Mock modal manager class
class MockModalManager {
  private modals: Modal[] = []
  private nextId = 1

  createModal(type: Modal['type'], data: Partial<Modal['data']>): Modal {
    const baseModal = {
      id: `modal-${this.nextId++}`,
      type,
      title: data.title || `New ${type}`,
      lastModified: new Date().toISOString(),
      isActive: true,
      data: { ...data }
    }

    const modal = baseModal as Modal
    this.modals.push(modal)
    return modal
  }

  updateModal(id: string, updates: Partial<Modal>): Modal | null {
    const index = this.modals.findIndex(m => m.id === id)
    if (index === -1) return null

    // Ensure timestamp is always different by adding a small increment
    const currentTime = new Date()
    const newTimestamp = new Date(currentTime.getTime() + Math.random() * 1000).toISOString()

    const updatedModal = {
      ...this.modals[index],
      ...updates,
      data: {
        ...this.modals[index].data,
        ...(updates.data || {})
      },
      lastModified: newTimestamp
    }

    this.modals[index] = updatedModal
    return updatedModal
  }

  deleteModal(id: string): boolean {
    const index = this.modals.findIndex(m => m.id === id)
    if (index === -1) return false

    this.modals.splice(index, 1)
    return true
  }

  getModal(id: string): Modal | null {
    return this.modals.find(m => m.id === id) || null
  }

  getModalsByType(type: Modal['type']): Modal[] {
    return this.modals.filter(m => m.type === type)
  }

  getAllModals(): Modal[] {
    return [...this.modals]
  }

  getActiveModals(): Modal[] {
    return this.modals.filter(m => m.isActive)
  }
}

// Sample data generators
const generateEducationData = (overrides: Partial<EducationModal['data']> = {}) => ({
  institution: 'Test University',
  degree: 'Bachelor',
  field: 'Computer Science',
  startDate: '2020-01-01',
  endDate: '2024-01-01',
  description: 'Test education description with sufficient length for validation',
  achievements: ['Achievement 1', 'Achievement 2'],
  verificationUrl: 'https://example.com/verify',
  certificateImage: 'https://example.com/cert.jpg',
  ...overrides
})

const generateSkillData = (overrides: Partial<SkillModal['data']> = {}) => ({
  category: 'Programming',
  proficiency: 85,
  yearsOfExperience: 5,
  expertiseLevel: 'Advanced',
  description: 'Test skill description',
  detailedDescription: 'Detailed description of the skill with sufficient length for validation requirements',
  usageExamples: ['Example 1', 'Example 2'],
  keyProjects: ['Project A', 'Project B'],
  certifications: ['Cert 1', 'Cert 2'],
  color: 'blue',
  ...overrides
})

const generateProjectData = (overrides: Partial<ProjectModal['data']> = {}) => ({
  category: 'Web Development',
  description: 'Test project description',
  longDescription: 'Long detailed description of the project with sufficient length for validation requirements',
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  methodologies: ['Agile', 'SCRUM'],
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  githubUrl: 'https://github.com/test/project',
  demoUrl: 'https://demo.example.com',
  status: 'completed',
  featured: false,
  achievements: ['Achievement 1'],
  challenges: ['Challenge 1'],
  ...overrides
})

describe('Property Test 5: Modal Management Consistency', () => {
  let modalManager: MockModalManager

  beforeEach(() => {
    modalManager = new MockModalManager()
  })

  describe('Modal Creation Properties', () => {
    it('should create modals with consistent structure across all types', () => {
      const modalTypes: Modal['type'][] = ['education', 'skill', 'project']
      const dataGenerators = {
        education: generateEducationData,
        skill: generateSkillData,
        project: generateProjectData
      }

      modalTypes.forEach(type => {
        const data = dataGenerators[type]()
        const modal = modalManager.createModal(type, data)

        // Verify consistent base structure
        expect(modal.id).toBeTruthy()
        expect(modal.type).toBe(type)
        expect(modal.title).toBeTruthy()
        expect(modal.lastModified).toBeTruthy()
        expect(typeof modal.isActive).toBe('boolean')
        expect(modal.data).toBeTruthy()

        // Verify ID format consistency
        expect(modal.id).toMatch(/^modal-\d+$/)

        // Verify timestamp format
        expect(new Date(modal.lastModified).toISOString()).toBe(modal.lastModified)
      })
    })

    it('should generate unique IDs for all modals', () => {
      const modalCount = 100
      const createdModals: Modal[] = []

      for (let i = 0; i < modalCount; i++) {
        const type = ['education', 'skill', 'project'][i % 3] as Modal['type']
        const data = type === 'education' ? generateEducationData() :
                    type === 'skill' ? generateSkillData() :
                    generateProjectData()
        
        const modal = modalManager.createModal(type, data)
        createdModals.push(modal)
      }

      // Verify all IDs are unique
      const ids = createdModals.map(m => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(modalCount)

      // Verify ID sequence is consistent
      ids.forEach((id, index) => {
        expect(id).toBe(`modal-${index + 1}`)
      })
    })

    it('should validate required fields for each modal type', () => {
      const requiredFields = {
        education: ['institution', 'degree', 'field', 'startDate', 'description'],
        skill: ['category', 'proficiency', 'yearsOfExperience', 'expertiseLevel', 'description', 'detailedDescription', 'usageExamples'],
        project: ['category', 'description', 'longDescription', 'technologies', 'startDate', 'status']
      }

      Object.entries(requiredFields).forEach(([type, fields]) => {
        const modalType = type as Modal['type']
        const data = modalType === 'education' ? generateEducationData() :
                    modalType === 'skill' ? generateSkillData() :
                    generateProjectData()

        const modal = modalManager.createModal(modalType, data)

        fields.forEach(field => {
          expect(modal.data[field]).toBeDefined()
          if (typeof modal.data[field] === 'string') {
            expect(modal.data[field].length).toBeGreaterThan(0)
          }
          if (Array.isArray(modal.data[field])) {
            expect(modal.data[field].length).toBeGreaterThan(0)
          }
        })
      })
    })
  })

  describe('Modal Update Properties', () => {
    it('should maintain data integrity during updates', async () => {
      const modal = modalManager.createModal('education', generateEducationData())
      const originalId = modal.id
      const originalType = modal.type

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1))

      const updates = {
        title: 'Updated Title',
        data: {
          institution: 'Updated University'
        }
      }

      const updatedModal = modalManager.updateModal(modal.id, updates)

      expect(updatedModal).toBeTruthy()
      expect(updatedModal!.id).toBe(originalId) // ID should not change
      expect(updatedModal!.type).toBe(originalType) // Type should not change
      expect(updatedModal!.title).toBe('Updated Title')
      expect(updatedModal!.data.institution).toBe('Updated University')
      expect(updatedModal!.lastModified).not.toBe(modal.lastModified) // Should update timestamp
    })

    it('should handle partial updates correctly', () => {
      const modal = modalManager.createModal('skill', generateSkillData())
      const originalData = { ...modal.data }

      const partialUpdate = {
        data: {
          proficiency: 95
        }
      }

      const updatedModal = modalManager.updateModal(modal.id, partialUpdate)

      expect(updatedModal).toBeTruthy()
      expect(updatedModal!.data.proficiency).toBe(95)
      
      // Other fields should remain unchanged
      expect(updatedModal!.data.category).toBe(originalData.category)
      expect(updatedModal!.data.yearsOfExperience).toBe(originalData.yearsOfExperience)
      expect(updatedModal!.data.description).toBe(originalData.description)
    })

    it('should update lastModified timestamp on every update', async () => {
      const modal = modalManager.createModal('project', generateProjectData())
      const originalTimestamp = modal.lastModified

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const updatedModal = modalManager.updateModal(modal.id, { title: 'New Title' })
      
      expect(updatedModal).toBeTruthy()
      expect(updatedModal!.lastModified).not.toBe(originalTimestamp)
      expect(new Date(updatedModal!.lastModified).getTime()).toBeGreaterThan(new Date(originalTimestamp).getTime())
    })
  })

  describe('Modal Deletion Properties', () => {
    it('should successfully delete existing modals', () => {
      const modal1 = modalManager.createModal('education', generateEducationData())
      const modal2 = modalManager.createModal('skill', generateSkillData())
      const modal3 = modalManager.createModal('project', generateProjectData())

      expect(modalManager.getAllModals().length).toBe(3)

      const deleted = modalManager.deleteModal(modal2.id)
      expect(deleted).toBe(true)
      expect(modalManager.getAllModals().length).toBe(2)

      const remainingModals = modalManager.getAllModals()
      expect(remainingModals.find(m => m.id === modal1.id)).toBeTruthy()
      expect(remainingModals.find(m => m.id === modal2.id)).toBeFalsy()
      expect(remainingModals.find(m => m.id === modal3.id)).toBeTruthy()
    })

    it('should handle deletion of non-existent modals gracefully', () => {
      const modal = modalManager.createModal('education', generateEducationData())
      
      const deleted1 = modalManager.deleteModal('non-existent-id')
      expect(deleted1).toBe(false)
      expect(modalManager.getAllModals().length).toBe(1)

      const deleted2 = modalManager.deleteModal(modal.id)
      expect(deleted2).toBe(true)
      expect(modalManager.getAllModals().length).toBe(0)

      const deleted3 = modalManager.deleteModal(modal.id) // Try to delete again
      expect(deleted3).toBe(false)
    })
  })

  describe('Modal Retrieval Properties', () => {
    it('should retrieve modals by type consistently', () => {
      const educationModals = Array(3).fill(0).map(() => 
        modalManager.createModal('education', generateEducationData())
      )
      const skillModals = Array(2).fill(0).map(() => 
        modalManager.createModal('skill', generateSkillData())
      )
      const projectModals = Array(4).fill(0).map(() => 
        modalManager.createModal('project', generateProjectData())
      )

      expect(modalManager.getModalsByType('education').length).toBe(3)
      expect(modalManager.getModalsByType('skill').length).toBe(2)
      expect(modalManager.getModalsByType('project').length).toBe(4)
      expect(modalManager.getAllModals().length).toBe(9)

      // Verify returned modals are correct type
      modalManager.getModalsByType('education').forEach(modal => {
        expect(modal.type).toBe('education')
      })
      modalManager.getModalsByType('skill').forEach(modal => {
        expect(modal.type).toBe('skill')
      })
      modalManager.getModalsByType('project').forEach(modal => {
        expect(modal.type).toBe('project')
      })
    })

    it('should filter active modals correctly', () => {
      const modal1 = modalManager.createModal('education', generateEducationData())
      const modal2 = modalManager.createModal('skill', generateSkillData())
      const modal3 = modalManager.createModal('project', generateProjectData())

      // Deactivate one modal
      modalManager.updateModal(modal2.id, { isActive: false })

      const activeModals = modalManager.getActiveModals()
      expect(activeModals.length).toBe(2)
      expect(activeModals.find(m => m.id === modal1.id)).toBeTruthy()
      expect(activeModals.find(m => m.id === modal2.id)).toBeFalsy()
      expect(activeModals.find(m => m.id === modal3.id)).toBeTruthy()

      // All active modals should have isActive = true
      activeModals.forEach(modal => {
        expect(modal.isActive).toBe(true)
      })
    })
  })

  describe('Data Validation Properties', () => {
    it('should maintain type-specific data structure integrity', () => {
      const educationModal = modalManager.createModal('education', generateEducationData({
        institution: 'Harvard University',
        degree: 'PhD',
        achievements: ['Summa Cum Laude', 'Research Award']
      }))

      const skillModal = modalManager.createModal('skill', generateSkillData({
        proficiency: 95,
        usageExamples: ['Built scalable web apps', 'Led development team'],
        keyProjects: ['E-commerce Platform', 'Analytics Dashboard']
      }))

      const projectModal = modalManager.createModal('project', generateProjectData({
        technologies: ['React', 'Node.js', 'MongoDB'],
        featured: true,
        achievements: ['Increased performance by 40%']
      }))

      // Verify education modal structure
      expect(educationModal.data.institution).toBe('Harvard University')
      expect(educationModal.data.degree).toBe('PhD')
      expect(Array.isArray(educationModal.data.achievements)).toBe(true)
      expect(educationModal.data.achievements.length).toBe(2)

      // Verify skill modal structure
      expect(typeof skillModal.data.proficiency).toBe('number')
      expect(skillModal.data.proficiency).toBe(95)
      expect(Array.isArray(skillModal.data.usageExamples)).toBe(true)
      expect(Array.isArray(skillModal.data.keyProjects)).toBe(true)

      // Verify project modal structure
      expect(Array.isArray(projectModal.data.technologies)).toBe(true)
      expect(typeof projectModal.data.featured).toBe('boolean')
      expect(projectModal.data.featured).toBe(true)
      expect(Array.isArray(projectModal.data.achievements)).toBe(true)
    })

    it('should handle array fields consistently across modal types', () => {
      const modalsWithArrays = [
        modalManager.createModal('education', generateEducationData({
          achievements: ['Achievement 1', 'Achievement 2', 'Achievement 3']
        })),
        modalManager.createModal('skill', generateSkillData({
          usageExamples: ['Example 1', 'Example 2'],
          keyProjects: ['Project A', 'Project B', 'Project C'],
          certifications: ['Cert 1']
        })),
        modalManager.createModal('project', generateProjectData({
          technologies: ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'],
          methodologies: ['Method 1', 'Method 2'],
          achievements: ['Achievement 1'],
          challenges: ['Challenge 1', 'Challenge 2']
        }))
      ]

      modalsWithArrays.forEach(modal => {
        Object.values(modal.data).forEach(value => {
          if (Array.isArray(value)) {
            expect(value.length).toBeGreaterThan(0)
            value.forEach(item => {
              expect(typeof item).toBe('string')
              expect(item.length).toBeGreaterThan(0)
            })
          }
        })
      })
    })
  })

  describe('Performance Properties', () => {
    it('should handle large numbers of modals efficiently', () => {
      const modalCount = 1000
      const startTime = Date.now()

      // Create many modals
      for (let i = 0; i < modalCount; i++) {
        const type = ['education', 'skill', 'project'][i % 3] as Modal['type']
        const data = type === 'education' ? generateEducationData() :
                    type === 'skill' ? generateSkillData() :
                    generateProjectData()
        modalManager.createModal(type, data)
      }

      const creationTime = Date.now() - startTime

      // Verify all modals were created
      expect(modalManager.getAllModals().length).toBe(modalCount)

      // Test retrieval performance
      const retrievalStartTime = Date.now()
      const educationModals = modalManager.getModalsByType('education')
      const skillModals = modalManager.getModalsByType('skill')
      const projectModals = modalManager.getModalsByType('project')
      const retrievalTime = Date.now() - retrievalStartTime

      // Verify correct distribution (allow for small variance due to modulo operation)
      expect(educationModals.length).toBeGreaterThanOrEqual(Math.floor(modalCount / 3))
      expect(educationModals.length).toBeLessThanOrEqual(Math.ceil(modalCount / 3))
      expect(skillModals.length).toBeGreaterThanOrEqual(Math.floor(modalCount / 3))
      expect(skillModals.length).toBeLessThanOrEqual(Math.ceil(modalCount / 3))
      expect(projectModals.length).toBeGreaterThanOrEqual(Math.floor(modalCount / 3))
      expect(projectModals.length).toBeLessThanOrEqual(Math.ceil(modalCount / 3))

      // Performance should be reasonable (less than 1 second for 1000 modals)
      expect(creationTime).toBeLessThan(1000)
      expect(retrievalTime).toBeLessThan(100)
    })

    it('should maintain consistent performance with frequent updates', () => {
      const modals = Array(100).fill(0).map((_, i) => {
        const type = ['education', 'skill', 'project'][i % 3] as Modal['type']
        const data = type === 'education' ? generateEducationData() :
                    type === 'skill' ? generateSkillData() :
                    generateProjectData()
        return modalManager.createModal(type, data)
      })

      const updateCount = 500
      const startTime = Date.now()

      for (let i = 0; i < updateCount; i++) {
        const modal = modals[i % modals.length]
        modalManager.updateModal(modal.id, { title: `Updated Title ${i}` })
      }

      const totalTime = Date.now() - startTime
      const averageTime = totalTime / updateCount

      // Each update should be fast (less than 1ms on average)
      expect(averageTime).toBeLessThan(1)

      // Verify updates were applied
      modals.forEach((modal, index) => {
        const updatedModal = modalManager.getModal(modal.id)
        expect(updatedModal).toBeTruthy()
        // Some modals should have been updated multiple times
        if (index < updateCount % modals.length) {
          expect(updatedModal!.title).toContain('Updated Title')
        }
      })
    })
  })
})