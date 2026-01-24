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
  FolderOpen, 
  Calendar, 
  ExternalLink, 
  Github, 
  Upload,
  Tag,
  Star,
  Globe
} from "lucide-react"

// Schema de validação para modal de projeto
const projectModalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  category: z.string().min(1, "Categoria é obrigatória").max(100, "Categoria muito longa"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(500, "Descrição muito longa"),
  longDescription: z.string().min(50, "Descrição detalhada deve ter pelo menos 50 caracteres"),
  technologies: z.array(z.string()).min(1, "Pelo menos uma tecnologia é obrigatória"),
  methodologies: z.array(z.string()).optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  githubUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  demoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  projectUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["completed", "in-progress", "planned", "archived"]).default("completed"),
  teamSize: z.number().min(1, "Tamanho da equipe deve ser pelo menos 1").optional(),
  role: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

type ProjectModalFormData = z.infer<typeof projectModalSchema>

interface ProjectModalEditorProps {
  modal: any
  onSave: (data: ProjectModalFormData) => Promise<void>
  onCancel: () => void
}

const projectStatuses = [
  { value: "completed", label: "Concluído", color: "text-green-600" },
  { value: "in-progress", label: "Em Andamento", color: "text-blue-600" },
  { value: "planned", label: "Planejado", color: "text-yellow-600" },
  { value: "archived", label: "Arquivado", color: "text-gray-600" }
]

export function ProjectModalEditor({ modal, onSave, onCancel }: ProjectModalEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [longDescription, setLongDescription] = useState("")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [methodologies, setMethodologies] = useState<string[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [challenges, setChallenges] = useState<string[]>([])
  const [projectImageUrl, setProjectImageUrl] = useState("")
  
  // Estados para novos itens
  const [newTechnology, setNewTechnology] = useState("")
  const [newMethodology, setNewMethodology] = useState("")
  const [newAchievement, setNewAchievement] = useState("")
  const [newChallenge, setNewChallenge] = useState("")

  const form = useForm<ProjectModalFormData>({
    resolver: zodResolver(projectModalSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      longDescription: "",
      technologies: [],
      methodologies: [],
      startDate: "",
      endDate: "",
      githubUrl: "",
      demoUrl: "",
      projectUrl: "",
      imageUrl: "",
      featured: false,
      status: "completed",
      teamSize: 1,
      role: "",
      achievements: [],
      challenges: [],
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
        description: data.description || "",
        longDescription: data.longDescription || "",
        technologies: data.technologies || [],
        methodologies: data.methodologies || [],
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        githubUrl: data.githubUrl || "",
        demoUrl: data.demoUrl || "",
        projectUrl: data.projectUrl || "",
        imageUrl: data.imageUrl || "",
        featured: data.featured || false,
        status: data.status || "completed",
        teamSize: data.teamSize || 1,
        role: data.role || "",
        achievements: data.achievements || [],
        challenges: data.challenges || [],
        isActive: modal.isActive ?? true,
      })
      
      setLongDescription(data.longDescription || "")
      setTechnologies(data.technologies || [])
      setMethodologies(data.methodologies || [])
      setAchievements(data.achievements || [])
      setChallenges(data.challenges || [])
      setProjectImageUrl(data.imageUrl || "")
    }
  }, [modal, reset])

  const onSubmit = async (data: ProjectModalFormData) => {
    setIsSaving(true)
    try {
      const formData = {
        ...data,
        longDescription,
        technologies,
        methodologies,
        achievements,
        challenges,
        imageUrl: projectImageUrl,
      }
      await onSave(formData)
    } catch (error) {
      console.error("Erro ao salvar modal de projeto:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLongDescriptionChange = (content: string) => {
    setLongDescription(content)
    setValue("longDescription", content)
  }

  const handleImageUpload = (url: string) => {
    setProjectImageUrl(url)
    setValue("imageUrl", url)
  }

  // Funções para gerenciar arrays
  const addToArray = (
    array: string[], 
    setArray: (arr: string[]) => void, 
    newItem: string, 
    setNewItem: (item: string) => void,
    fieldName: keyof ProjectModalFormData
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
    fieldName: keyof ProjectModalFormData
  ) => {
    const updatedArray = array.filter((_, i) => i !== index)
    setArray(updatedArray)
    setValue(fieldName, updatedArray as any)
  }

  return (
    <AdminFormContainer
      title="Editor de Modal - Projeto"
      description="Configure os detalhes completos do projeto"
      isSaving={isSaving}
      onSave={handleSubmit(onSubmit)}
      onCancel={onCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <FormSection
          title="Informações Básicas"
          description="Dados principais do projeto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nome do Projeto"
              error={errors.title?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Nome do projeto"
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
                  placeholder="Ex: Web Development, Quality Engineering"
                />
              </div>
            </FormField>
          </div>

          <FormField
            label="Descrição Resumida"
            error={errors.description?.message}
            required
            description="Breve descrição que aparece no card do projeto"
          >
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              placeholder="Breve descrição do projeto..."
            />
          </FormField>
        </FormSection>

        {/* Período e Status */}
        <FormSection
          title="Período e Status"
          description="Datas e status atual do projeto"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField
              label="Data de Início"
              error={errors.startDate?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("startDate")}
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </FormField>

            <FormField
              label="Data de Conclusão"
              error={errors.endDate?.message}
              description="Deixe em branco se em andamento"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("endDate")}
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </FormField>

            <FormField
              label="Status"
              error={errors.status?.message}
              required
            >
              <select
                {...register("status")}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                {projectStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Tamanho da Equipe"
              error={errors.teamSize?.message}
            >
              <input
                {...register("teamSize", { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="1"
              />
            </FormField>
          </div>

          <FormField
            label="Seu Papel no Projeto"
            error={errors.role?.message}
            description="Descreva sua função/responsabilidade no projeto"
          >
            <input
              {...register("role")}
              type="text"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Ex: Desenvolvedor Frontend, Líder de Projeto, Engenheiro de Qualidade"
            />
          </FormField>
        </FormSection>

        {/* Descrição Detalhada */}
        <FormSection
          title="Descrição Detalhada"
          description="Descrição completa do projeto, objetivos e implementação"
        >
          <FormField
            label="Conteúdo Detalhado"
            error={errors.longDescription?.message}
            required
          >
            <RichTextEditor
              content={longDescription}
              onChange={handleLongDescriptionChange}
              placeholder="Descreva detalhadamente o projeto, seus objetivos, desafios enfrentados, soluções implementadas e resultados obtidos..."
              minHeight="300px"
            />
          </FormField>
        </FormSection>

        {/* Tecnologias e Metodologias */}
        <FormSection
          title="Tecnologias e Metodologias"
          description="Tecnologias utilizadas e metodologias aplicadas"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Tecnologias"
              error={errors.technologies?.message}
              required
              description="Tecnologias, linguagens e ferramentas utilizadas"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Ex: React, Node.js, PostgreSQL"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(technologies, setTechnologies, newTechnology, setNewTechnology, 'technologies'))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(technologies, setTechnologies, newTechnology, setNewTechnology, 'technologies')} 
                    variant="outline"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, index) => (
                      <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => removeFromArray(technologies, setTechnologies, index, 'technologies')}
                          className="text-primary hover:text-primary/70 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField
              label="Metodologias"
              description="Metodologias e práticas aplicadas no projeto"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMethodology}
                    onChange={(e) => setNewMethodology(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Ex: Agile, SCRUM, TDD"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(methodologies, setMethodologies, newMethodology, setNewMethodology, 'methodologies'))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(methodologies, setMethodologies, newMethodology, setNewMethodology, 'methodologies')} 
                    variant="outline"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {methodologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {methodologies.map((method, index) => (
                      <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200">
                        <span>{method}</span>
                        <button
                          type="button"
                          onClick={() => removeFromArray(methodologies, setMethodologies, index, 'methodologies')}
                          className="text-green-700 hover:text-green-500 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Links do Projeto */}
        <FormSection
          title="Links do Projeto"
          description="URLs relacionadas ao projeto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="GitHub"
              error={errors.githubUrl?.message}
              description="Repositório do código fonte"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Github className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("githubUrl")}
                  type="url"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="https://github.com/usuario/projeto"
                />
              </div>
            </FormField>

            <FormField
              label="Demo/Preview"
              error={errors.demoUrl?.message}
              description="Link para demonstração"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("demoUrl")}
                  type="url"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="https://projeto-demo.com"
                />
              </div>
            </FormField>

            <FormField
              label="Site do Projeto"
              error={errors.projectUrl?.message}
              description="Site oficial ou página do projeto"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("projectUrl")}
                  type="url"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="https://projeto.com"
                />
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Conquistas e Desafios */}
        <FormSection
          title="Conquistas e Desafios"
          description="Principais conquistas e desafios enfrentados"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Conquistas"
              description="Principais resultados e conquistas do projeto"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Ex: Reduziu tempo de processamento em 50%"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(achievements, setAchievements, newAchievement, setNewAchievement, 'achievements'))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(achievements, setAchievements, newAchievement, setNewAchievement, 'achievements')} 
                    variant="outline"
                    size="sm"
                  >
                    +
                  </Button>
                </div>
                
                {achievements.length > 0 && (
                  <div className="space-y-2">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-sm text-green-800">{achievement}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray(achievements, setAchievements, index, 'achievements')}
                          className="text-green-600 hover:text-green-800 h-6 w-6 p-0"
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
              label="Desafios"
              description="Principais desafios enfrentados e como foram resolvidos"
            >
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Ex: Integração com sistema legado"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(challenges, setChallenges, newChallenge, setNewChallenge, 'challenges'))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray(challenges, setChallenges, newChallenge, setNewChallenge, 'challenges')} 
                    variant="outline"
                    size="sm"
                  >
                    +
                  </Button>
                </div>
                
                {challenges.length > 0 && (
                  <div className="space-y-2">
                    {challenges.map((challenge, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                        <span className="text-sm text-orange-800">{challenge}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromArray(challenges, setChallenges, index, 'challenges')}
                          className="text-orange-600 hover:text-orange-800 h-6 w-6 p-0"
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

        {/* Configurações */}
        <FormSection
          title="Configurações"
          description="Imagem e configurações do projeto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Projeto em Destaque"
              description="Marcar como projeto destacado na página principal"
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register("featured")}
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-foreground">Projeto em destaque</span>
              </label>
            </FormField>

            <FormField
              label="Status"
              description="Ativar/desativar este projeto"
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Projeto ativo</span>
              </label>
            </FormField>
          </div>

          <FormField
            label="Imagem do Projeto"
            description="Upload de imagem representativa do projeto"
          >
            <div className="space-y-4">
              {projectImageUrl && (
                <div className="relative inline-block">
                  <img
                    src={projectImageUrl}
                    alt="Imagem do projeto"
                    className="max-w-md h-auto rounded-lg border border-border shadow-sm"
                  />
                </div>
              )}
              
              <ImageUploader
                onUpload={handleImageUpload}
                category="projects"
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
              >
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {projectImageUrl ? "Alterar Imagem" : "Adicionar Imagem"}
                </Button>
              </ImageUploader>
            </div>
          </FormField>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}