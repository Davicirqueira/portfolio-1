"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { RichTextEditor } from "@/components/admin/ui/RichTextEditor"
import { ImageUploader } from "@/components/admin/media/ImageUploader"
import { 
  Code, 
  Star, 
  Calendar, 
  Briefcase, 
  Upload,
  Tag,
  TrendingUp
} from "lucide-react"

// Schema de validação para modal de habilidade
const skillModalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  category: z.string().min(1, "Categoria é obrigatória").max(100, "Categoria muito longa"),
  proficiency: z.number().min(1, "Proficiência mínima é 1").max(100, "Proficiência máxima é 100"),
  yearsOfExperience: z.number().min(0, "Anos de experiência não pode ser negativo").max(50, "Máximo 50 anos"),
  expertiseLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert", "Specialist"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  detailedDescription: z.string().min(50, "Descrição detalhada deve ter pelo menos 50 caracteres"),
  usageExamples: z.array(z.string()).min(1, "Pelo menos um exemplo de uso é obrigatório"),
  keyProjects: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  relatedSkills: z.array(z.string()).optional(),
  skillIcon: z.string().optional(),
  color: z.enum(["blue", "green", "purple", "orange", "red"]).default("blue"),
  isActive: z.boolean().default(true),
})

type SkillModalFormData = z.infer<typeof skillModalSchema>

interface SkillModalEditorProps {
  modal: any
  onSave: (data: SkillModalFormData) => Promise<void>
  onCancel: () => void
}

const expertiseLevels = [
  { value: "Beginner", label: "Iniciante", description: "Conhecimento básico" },
  { value: "Intermediate", label: "Intermediário", description: "Conhecimento sólido" },
  { value: "Advanced", label: "Avançado", description: "Conhecimento profundo" },
  { value: "Expert", label: "Especialista", description: "Conhecimento excepcional" },
  { value: "Specialist", label: "Especialista Sênior", description: "Autoridade no assunto" }
]

const skillColors = [
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "green", label: "Verde", class: "bg-green-500" },
  { value: "purple", label: "Roxo", class: "bg-purple-500" },
  { value: "orange", label: "Laranja", class: "bg-orange-500" },
  { value: "red", label: "Vermelho", class: "bg-red-500" }
]

export function SkillModalEditor({ modal, onSave, onCancel }: SkillModalEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [detailedDescription, setDetailedDescription] = useState("")
  const [usageExamples, setUsageExamples] = useState<string[]>([])
  const [keyProjects, setKeyProjects] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [relatedSkills, setRelatedSkills] = useState<string[]>([])
  const [skillIconUrl, setSkillIconUrl] = useState("")
  
  // Estados para novos itens
  const [newUsageExample, setNewUsageExample] = useState("")
  const [newKeyProject, setNewKeyProject] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [newRelatedSkill, setNewRelatedSkill] = useState("")

  const form = useForm<SkillModalFormData>({
    resolver: zodResolver(skillModalSchema),
    defaultValues: {
      title: "",
      category: "",
      proficiency: 50,
      yearsOfExperience: 0,
      expertiseLevel: "Intermediate",
      description: "",
      detailedDescription: "",
      usageExamples: [],
      keyProjects: [],
      certifications: [],
      relatedSkills: [],
      skillIcon: "",
      color: "blue",
      isActive: true,
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Carrega os dados do modal quando disponível
  useEffect(() => {
    if (modal) {
      const data = modal.data || {}
      reset({
        title: modal.title || "",
        category: data.category || "",
        proficiency: data.proficiency || 50,
        yearsOfExperience: data.yearsOfExperience || 0,
        expertiseLevel: data.expertiseLevel || "Intermediate",
        description: data.description || "",
        detailedDescription: data.detailedDescription || "",
        usageExamples: data.usageExamples || [],
        keyProjects: data.keyProjects || [],
        certifications: data.certifications || [],
        relatedSkills: data.relatedSkills || [],
        skillIcon: data.skillIcon || "",
        color: data.color || "blue",
        isActive: modal.isActive ?? true,
      })
      
      setDetailedDescription(data.detailedDescription || "")
      setUsageExamples(data.usageExamples || [])
      setKeyProjects(data.keyProjects || [])
      setCertifications(data.certifications || [])
      setRelatedSkills(data.relatedSkills || [])
      setSkillIconUrl(data.skillIcon || "")
    }
  }, [modal, reset])

  const onSubmit = async (data: SkillModalFormData) => {
    setIsSaving(true)
    try {
      const formData = {
        ...data,
        detailedDescription,
        usageExamples,
        keyProjects,
        certifications,
        relatedSkills,
        skillIcon: skillIconUrl,
      }
      await onSave(formData)
    } catch (error) {
      console.error("Erro ao salvar modal de habilidade:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDetailedDescriptionChange = (content: string) => {
    setDetailedDescription(content)
    setValue("detailedDescription", content)
  }

  const handleIconUpload = (url: string) => {
    setSkillIconUrl(url)
    setValue("skillIcon", url)
  }

  // Funções para gerenciar arrays
  const addToArray = (
    array: string[], 
    setArray: (arr: string[]) => void, 
    newItem: string, 
    setNewItem: (item: string) => void,
    fieldName: keyof SkillModalFormData
  ) => {
    if (newItem.trim()) {
      const updatedArray = [...array, newItem.trim()]
      setArray(updatedArray)
      setValue(fieldName, updatedArray as any)
      setNewItem("")
    }
  }

  const removeFromArray = (
    array: string[], 
    setArray: (arr: string[]) => void, 
    index: number,
    fieldName: keyof SkillModalFormData
  ) => {
    const updatedArray = array.filter((_, i) => i !== index)
    setArray(updatedArray)
    setValue(fieldName, updatedArray as any)
  }

  return (
    <AdminFormContainer
      title="Editor de Modal - Habilidade"
      description="Configure os detalhes da habilidade técnica ou metodologia"
      isSaving={isSaving}
      onSave={handleSubmit(onSubmit)}
      onCancel={onCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <FormSection
          title="Informações Básicas"
          description="Dados principais da habilidade"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nome da Habilidade"
              error={errors.title?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Code className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: React, PFMEA, Python"
                />
              </div>
            </FormField>

            <FormField
              label="Categoria"
              error={errors.category?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("category")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: Frontend, Qualidade, Backend"
                />
              </div>
            </FormField>
          </div>

          <FormField
            label="Descrição Resumida"
            error={errors.description?.message}
            required
            description="Breve descrição da habilidade (aparece no card)"
          >
            <textarea
              {...register("description")}
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              placeholder="Breve descrição da habilidade..."
            />
          </FormField>
        </FormSection>

        {/* Nível de Expertise */}
        <FormSection
          title="Nível de Expertise"
          description="Defina o nível de proficiência e experiência"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Proficiência (%)"
              error={errors.proficiency?.message}
              required
            >
              <div className="space-y-2">
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
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${watch("proficiency") || 0}%` }}
                  />
                </div>
              </div>
            </FormField>

            <FormField
              label="Anos de Experiência"
              error={errors.yearsOfExperience?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("yearsOfExperience", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="50"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </FormField>

            <FormField
              label="Nível de Expertise"
              error={errors.expertiseLevel?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <select
                  {...register("expertiseLevel")}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                >
                  {expertiseLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Descrição Detalhada */}
        <FormSection
          title="Descrição Detalhada"
          description="Descrição completa da habilidade e experiência"
        >
          <FormField
            label="Conteúdo Detalhado"
            error={errors.detailedDescription?.message}
            required
          >
            <RichTextEditor
              content={detailedDescription}
              onChange={handleDetailedDescriptionChange}
              placeholder="Descreva detalhadamente sua experiência com esta habilidade, projetos onde foi aplicada, resultados obtidos..."
              minHeight="250px"
            />
          </FormField>
        </FormSection>

        {/* Exemplos de Uso */}
        <FormSection
          title="Exemplos de Uso"
          description="Exemplos práticos de aplicação da habilidade"
        >
          <FormField
            label="Exemplos de Uso"
            error={errors.usageExamples?.message}
            required
            description="Adicione exemplos específicos de como você aplicou esta habilidade"
          >
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newUsageExample}
                  onChange={(e) => setNewUsageExample(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: Desenvolveu sistema de controle de qualidade que reduziu defeitos em 30%"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(usageExamples, setUsageExamples, newUsageExample, setNewUsageExample, 'usageExamples'))}
                />
                <Button 
                  type="button" 
                  onClick={() => addToArray(usageExamples, setUsageExamples, newUsageExample, setNewUsageExample, 'usageExamples')} 
                  variant="outline"
                >
                  Adicionar
                </Button>
              </div>
              
              {usageExamples.length > 0 && (
                <div className="space-y-2">
                  {usageExamples.map((example, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <span className="text-sm text-foreground">{example}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromArray(usageExamples, setUsageExamples, index, 'usageExamples')}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>
        </FormSection>

        {/* Projetos e Certificações */}
        <FormSection
          title="Projetos e Certificações"
          description="Projetos relevantes e certificações relacionadas"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Projetos-Chave"
              description="Projetos onde esta habilidade foi fundamental"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newKeyProject}
                    onChange={(e) => setNewKeyProject(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Nome do projeto"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(keyProjects, setKeyProjects, newKeyProject, setNewKeyProject, 'keyProjects'))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(keyProjects, setKeyProjects, newKeyProject, setNewKeyProject, 'keyProjects')} 
                    variant="outline"
                    size="sm"
                  >
                    +
                  </Button>
                </div>
                
                {keyProjects.length > 0 && (
                  <div className="space-y-1">
                    {keyProjects.map((project, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                        <span className="text-sm text-foreground">{project}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray(keyProjects, setKeyProjects, index, 'keyProjects')}
                          className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(certifications, setCertifications, newCertification, setNewCertification, 'certifications'))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(certifications, setCertifications, newCertification, setNewCertification, 'certifications')} 
                    variant="outline"
                    size="sm"
                  >
                    +
                  </Button>
                </div>
                
                {certifications.length > 0 && (
                  <div className="space-y-1">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
                        <span className="text-sm text-foreground">{cert}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray(certifications, setCertifications, index, 'certifications')}
                          className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Configurações Visuais */}
        <FormSection
          title="Configurações Visuais"
          description="Ícone e cor da habilidade"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Cor da Habilidade"
              error={errors.color?.message}
              required
            >
              <div className="flex space-x-2">
                {skillColors.map(color => (
                  <label key={color.value} className="cursor-pointer">
                    <input
                      {...register("color")}
                      type="radio"
                      value={color.value}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-full ${color.class} border-2 ${watch("color") === color.value ? 'border-foreground' : 'border-transparent'} transition-colors`} />
                  </label>
                ))}
              </div>
            </FormField>

            <FormField
              label="Status"
              description="Ativar/desativar esta habilidade"
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Habilidade ativa</span>
              </label>
            </FormField>
          </div>

          <FormField
            label="Ícone da Habilidade"
            description="Upload de ícone personalizado (opcional)"
          >
            <div className="space-y-4">
              {skillIconUrl && (
                <div className="relative inline-block">
                  <img
                    src={skillIconUrl}
                    alt="Ícone da habilidade"
                    className="w-16 h-16 rounded-lg border border-border shadow-sm"
                  />
                </div>
              )}
              
              <ImageUploader
                onUpload={handleIconUpload}
                category="skill-icons"
                accept="image/*"
                maxSize={2 * 1024 * 1024} // 2MB
              >
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {skillIconUrl ? "Alterar Ícone" : "Adicionar Ícone"}
                </Button>
              </ImageUploader>
            </div>
          </FormField>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}