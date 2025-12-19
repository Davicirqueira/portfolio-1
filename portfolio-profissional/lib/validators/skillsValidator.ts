import { SkillItem, SkillCategory } from '@/lib/types/portfolio';

/**
 * Validates that a skill proficiency is within the valid range (1-100)
 */
export function validateSkillProficiency(proficiency: number): boolean {
  return Number.isInteger(proficiency) && proficiency >= 1 && proficiency <= 100;
}

/**
 * Validates that a skill item has all required properties and valid values
 */
export function validateSkillItem(skill: SkillItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!skill.name || typeof skill.name !== 'string' || skill.name.trim().length === 0) {
    errors.push('Skill name is required and must be a non-empty string');
  }

  if (!validateSkillProficiency(skill.proficiency)) {
    errors.push('Skill proficiency must be an integer between 1 and 100');
  }

  const validColors = ['blue', 'green', 'purple', 'orange', 'red'];
  if (!validColors.includes(skill.color)) {
    errors.push(`Skill color must be one of: ${validColors.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that a skill category has proper structure and valid skills
 */
export function validateSkillCategory(category: SkillCategory): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!category.id || typeof category.id !== 'string' || category.id.trim().length === 0) {
    errors.push('Category ID is required and must be a non-empty string');
  }

  if (!category.name || typeof category.name !== 'string' || category.name.trim().length === 0) {
    errors.push('Category name is required and must be a non-empty string');
  }

  if (!Array.isArray(category.skills)) {
    errors.push('Category skills must be an array');
  } else {
    category.skills.forEach((skill, index) => {
      const skillValidation = validateSkillItem(skill);
      if (!skillValidation.isValid) {
        errors.push(`Skill at index ${index}: ${skillValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an array of skill categories
 */
export function validateSkillCategories(categories: SkillCategory[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(categories)) {
    errors.push('Skill categories must be an array');
    return { isValid: false, errors };
  }

  const categoryIds = new Set<string>();
  categories.forEach((category, index) => {
    const categoryValidation = validateSkillCategory(category);
    if (!categoryValidation.isValid) {
      errors.push(`Category at index ${index}: ${categoryValidation.errors.join(', ')}`);
    }

    // Check for duplicate category IDs
    if (categoryIds.has(category.id)) {
      errors.push(`Duplicate category ID found: ${category.id}`);
    } else {
      categoryIds.add(category.id);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Safely handles malformed skill data by providing fallback values
 */
export function sanitizeSkillItem(skill: Partial<SkillItem>): SkillItem {
  return {
    name: typeof skill.name === 'string' ? skill.name.trim() : 'Unknown Skill',
    proficiency: validateSkillProficiency(skill.proficiency || 0) ? skill.proficiency! : 50,
    color: ['blue', 'green', 'purple', 'orange', 'red'].includes(skill.color || '') 
      ? skill.color as SkillItem['color'] 
      : 'blue',
    description: typeof skill.description === 'string' ? skill.description : undefined
  };
}

/**
 * Provides default skills if configuration is corrupted or missing
 */
export function getDefaultSkills(): SkillCategory[] {
  return [
    {
      id: 'automotive-quality',
      name: 'Qualidade e Processos Automotivos',
      skills: [
        { name: 'PFMEA', proficiency: 95, color: 'blue' },
        { name: 'APQP', proficiency: 90, color: 'green' },
        { name: 'Plano de Controle', proficiency: 90, color: 'purple' }
      ]
    },
    {
      id: 'process-analysis',
      name: 'Análise e Melhoria de Processos',
      skills: [
        { name: 'Mapeamento de Processos', proficiency: 90, color: 'orange' },
        { name: 'Melhoria Contínua', proficiency: 90, color: 'red' }
      ]
    }
  ];
}