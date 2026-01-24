"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { SkillItem } from "@/lib/types/portfolio"
import { 
  Code, 
  Star, 
  Palette,
  ExternalLink,
  Plus,
  X
} from "lucide-react"

// Schema de validação para habilidade
const skillSchema = z.object({
  name: z.string().min(1, "Nome da habilidade é obrigatório").max(100, "Nome muito longo"),
  proficiency: z.number().min(1, "Proficiência mínima é 1").max(100, "Proficiência máxima é 100"),
  color: z.enum(["blue", "green", "purple", "orange", "red"]).default("blue"),
  description: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  yearsOfExperience: z.number().min(0, "Anos de experiência não pode ser negativo").max(50, "Máximo 50 anos").optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  tags: z.array(z.string()).optional(),
})

type SkillFormData = z.infer<typeof skillSchema>

interface SkillItemEditorProps {
  skill: SkillItem
  categoryId: string
  onSave: (data: SkillItem) => void
  onCancel: () => void
}

const skillColors = [
  { value: "blue", label: "Azul", class: "bg-blue-500", lightClass: "bg-blue-100 border-blue-200" },
  { value: "green", label: "Verde", class: "bg-green-500", lightClass: "bg-green-100 border-green-200" },
  { value: "purple", label: "Roxo", class: "bg-purple-500", lightClass: "bg-purple-100 border-purple-200" },
  { value: "orange", label: "Laranja", class: "bg-orange-500", lightClass: "bg-orange-100 border-orange-200" },
  { value: "red", label: "Vermelho", class: "bg-red-500", lightClass: "bg-red-100 border-red-200" }
]

const skillLevels = [
  { value: "Beginner", label: "Iniciante", description: "Conhecimento básico" },
  { value: "Intermediate", label: "Intermediário", description: "Conhecimento sólido" },
  { value: "Advanced", label: "Avançado", description: "Conhecimento profundo" },
  { value: "Expert", label: "Especialista", description: "Conhecimento excepcional" }
]

export function SkillItemEditor({ skill, categoryId, onSave, onCancel }: SkillItemEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [certifications, setCertifications] = useState<string[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newCertification, setNewCertification] = useState("")
  const [newProject, setNewProject] = useState("")
  const [newTag, setNewTag] = useState("")

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      proficiency: 50,
      color: "blue",
      description: "",
      certifications: [],
      projects: [],
      yearsOfExperience: 0,
      level: "Intermediate",
      tags: [],
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Carrega os dados da habilidade quando disponível
  useEffect(() => {
    if (skill && skill.name) {
      const skillData = skill as any
      reset({
        name: skill.name || "",
        proficiency: skill.proficiency || 50,
        color: skill.color || "blue",
        description: skill.description || "",
        certifications: skillData.certifications || [],
        projects: skillData.projects || [],
        yearsOfExperience: skillData.yearsOfExperience || 0,
        level: skillData.level || "Intermediate",
        tags: skillData.tags || [],
      })
      
      setCertifications(skillData.certifications || [])
      setProjects(skillData.projects || [])
      setTags(skillData.tags || [])
    }
  }, [skill, reset])

  const onSubmit = async (data: SkillFormData) => {
    setIsSaving(true)
    try {
      const skillData: SkillItem = {
        name: data.name,
        proficiency: data.proficiency,
        color: data.color,
        description: data.description,
        // Propriedades extras
        certifications,
        projects,
        yearsOfExperience: data.yearsOfExperience,
        level: data.level,
        tags,
      } as SkillItem

      onSave(skillData)
    } catch (error) {
      console.error("Erro ao salvar habilidade:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Funções para gerenciar arrays
  const addToArray = (
    array: string[], 
    setArray: (arr: string[]) => void, 
    newItem: string, 
    setNewItem: (item: string) => void
  ) => {
    if (newItem.trim() && !array.includes(newItem.trim())) {
      const updatedArray = [...array, newItem.trim()]
      setArray(updatedArray)
      setNewItem("")
    }
  }

  const removeFromArray = (
    array: string[], 
    setArray: (arr: string[]) => void, 
    index: number
  ) => {
    const updatedArray = array.filter((_, i) => i !== index)
    setArray(updatedArray)
  }

  const selectedColor = watch("color")
  const proficiency = watch("proficiency")

  return (
    <AdminFormContainer
      title={skill?.name ? "Editar Habilidade" : "Nova Habilidade"}
      description="Configure os detalhes da habilidade técnica"
      isSaving={isSaving}
      onSave={handleSubmit(onSubmit)}
      onCancel={onCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <FormSection
          title="Informações Básicas"
          description="Nome e nível de proficiência da habilidade"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nome da Habilidade"
              error={errors.name?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Code className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: React, Python, PFMEA"
                />
              </div>
            </FormField>

            <FormField
              label="Nível de Experiência"
              error={errors.level?.message}
            >
              <select
                {...register("level")}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Proficiência (%)"
              error={errors.proficiency?.message}
              required
              description="Nível de domínio desta habilidade de 1 a 100"
            >
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Star className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    {...register("proficiency", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedColor === 'blue' ? 'bg-blue-500' :
                      selectedColor === 'green' ? 'bg-green-500' :
                      selectedColor === 'purple' ? 'bg-purple-500' :
                      selectedColor === 'orange' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${proficiency || 0}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {proficiency >= 90 ? 'Especialista' :
                   proficiency >= 75 ? 'Avançado' :
                   proficiency >= 50 ? 'Intermediário' :
                   proficiency >= 25 ? 'Básico' : 'Iniciante'}
                </div>
              </div>
            </FormField>

            <FormField
              label="Anos de Experiência"
              error={errors.yearsOfExperience?.message}
              description="Quantos anos você trabalha com esta habilidade"
            >
              <input
                {...register("yearsOfExperience", { valueAsNumber: true })}
                type="number"
                min="0"
                max="50"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField
            label="Descrição"
            error={errors.description?.message}
            description="Breve descrição sobre sua experiência com esta habilidade"
          >
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              placeholder="Descreva sua experiência e aplicações desta habilidade..."
            />
          </FormField>
        </FormSection>

        {/* Configurações Visuais */}
        <FormSection
          title="Configurações Visuais"
          description="Cor que representará esta habilidade"
        >
          <FormField
            label="Cor da Habilidade"
            error={errors.color?.message}
            required
          >
            <div className="flex space-x-3">
              {skillColors.map(color => (
                <label key={color.value} className="cursor-pointer">
                  <input
                    {...register("color")}
                    type="radio"
                    value={color.value}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedColor === color.value 
                      ? `${color.lightClass} border-current` 
                      : 'bg-muted border-border hover:border-primary/50'
                  }`}>
                    <div className="flex flex-col items-center space-y-1">
                      <div className={`w-4 h-4 rounded-full ${color.class}`} />
                      <span className="text-xs font-medium text-foreground">
                        {color.label}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </FormField>
        </FormSection>

        {/* Certificações e Projetos */}
        <FormSection
          title="Certificações e Projetos"
          description="Certificações e projetos relacionados a esta habilidade"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Certificações"
              description="Certificações relacionadas a esta habilidade"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Nome da certificação"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(certifications, setCertifications, newCertification, setNewCertification))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(certifications, setCertifications, newCertification, setNewCertification)} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {certifications.length > 0 && (
                  <div className="space-y-2">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border">
                        <span className="text-sm text-foreground">{cert}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray(certifications, setCertifications, index)}
                          className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField
              label="Projetos Relacionados"
              description="Projetos onde você aplicou esta habilidade"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Nome do projeto"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(projects, setProjects, newProject, setNewProject))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(projects, setProjects, newProject, setNewProject)} 
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {projects.length > 0 && (
                  <div className="space-y-2">
                    {projects.map((project, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border">
                        <span className="text-sm text-foreground">{project}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray(projects, setProjects, index)}
                          className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Tags */}
        <FormSection
          title="Tags"
          description="Tags para categorizar e filtrar esta habilidade"
        >
          <FormField
            label="Tags da Habilidade"
            description="Adicione tags para facilitar a busca e organização"
          >
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: frontend, library, framework"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(tags, setTags, newTag, setNewTag))}
                />
                <Button 
                  type="button" 
                  onClick={() => addToArray(tags, setTags, newTag, setNewTag)} 
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray(tags, setTags, index)}
                        className="text-primary hover:text-primary/70 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>
        </FormSection>

        {/* Preview */}
        <FormSection
          title="Preview"
          description="Visualização de como a habilidade aparecerá"
        >
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">
                {watch("name") || "Nome da Habilidade"}
              </span>
              <span className="text-sm text-muted-foreground">
                {proficiency || 0}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  selectedColor === 'blue' ? 'bg-blue-500' :
                  selectedColor === 'green' ? 'bg-green-500' :
                  selectedColor === 'purple' ? 'bg-purple-500' :
                  selectedColor === 'orange' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${proficiency || 0}%` }}
              />
            </div>
            {watch("description") && (
              <p className="text-xs text-muted-foreground">
                {watch("description")}
              </p>
            )}
          </div>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}