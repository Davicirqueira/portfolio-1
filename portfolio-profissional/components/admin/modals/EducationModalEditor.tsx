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
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award, 
  ExternalLink,
  Upload,
  Building
} from "lucide-react"

// Schema de validação para modal de educação
const educationModalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  institution: z.string().min(1, "Instituição é obrigatória").max(200, "Nome muito longo"),
  degree: z.string().min(1, "Grau é obrigatório").max(100, "Grau muito longo"),
  field: z.string().min(1, "Área de estudo é obrigatória").max(100, "Área muito longa"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  achievements: z.array(z.string()).optional(),
  verificationUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  certificateImage: z.string().optional(),
  isActive: z.boolean().default(true),
})

type EducationModalFormData = z.infer<typeof educationModalSchema>

interface EducationModalEditorProps {
  modal: any
  onSave: (data: EducationModalFormData) => Promise<void>
  onCancel: () => void
}

export function EducationModalEditor({ modal, onSave, onCancel }: EducationModalEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [description, setDescription] = useState("")
  const [achievements, setAchievements] = useState<string[]>([])
  const [newAchievement, setNewAchievement] = useState("")
  const [certificateImageUrl, setCertificateImageUrl] = useState("")

  const form = useForm<EducationModalFormData>({
    resolver: zodResolver(educationModalSchema),
    defaultValues: {
      title: "",
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      location: "",
      gpa: "",
      description: "",
      achievements: [],
      verificationUrl: "",
      certificateImage: "",
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
        institution: data.institution || "",
        degree: data.degree || "",
        field: data.field || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        location: data.location || "",
        gpa: data.gpa || "",
        description: data.description || "",
        achievements: data.achievements || [],
        verificationUrl: data.verificationUrl || "",
        certificateImage: data.certificateImage || "",
        isActive: modal.isActive ?? true,
      })
      
      setDescription(data.description || "")
      setAchievements(data.achievements || [])
      setCertificateImageUrl(data.certificateImage || "")
    }
  }, [modal, reset])

  const onSubmit = async (data: EducationModalFormData) => {
    setIsSaving(true)
    try {
      const formData = {
        ...data,
        description,
        achievements,
        certificateImage: certificateImageUrl,
      }
      await onSave(formData)
    } catch (error) {
      console.error("Erro ao salvar modal de educação:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDescriptionChange = (content: string) => {
    setDescription(content)
    setValue("description", content)
  }

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      const updatedAchievements = [...achievements, newAchievement.trim()]
      setAchievements(updatedAchievements)
      setValue("achievements", updatedAchievements)
      setNewAchievement("")
    }
  }

  const handleRemoveAchievement = (index: number) => {
    const updatedAchievements = achievements.filter((_, i) => i !== index)
    setAchievements(updatedAchievements)
    setValue("achievements", updatedAchievements)
  }

  const handleCertificateUpload = (url: string) => {
    setCertificateImageUrl(url)
    setValue("certificateImage", url)
  }

  return (
    <AdminFormContainer
      title="Editor de Modal - Formação"
      description="Configure os detalhes da formação acadêmica ou certificação"
      isSaving={isSaving}
      onSave={handleSubmit(onSubmit)}
      onCancel={onCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <FormSection
          title="Informações Básicas"
          description="Dados principais da formação ou certificação"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Título do Modal"
              error={errors.title?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: Bacharelado em Engenharia"
                />
              </div>
            </FormField>

            <FormField
              label="Instituição"
              error={errors.institution?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("institution")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Nome da instituição"
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Grau/Tipo"
              error={errors.degree?.message}
              required
            >
              <input
                {...register("degree")}
                type="text"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Ex: Bacharelado, Certificação"
              />
            </FormField>

            <FormField
              label="Área de Estudo"
              error={errors.field?.message}
              required
            >
              <input
                {...register("field")}
                type="text"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Ex: Engenharia Mecânica"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Período e Localização */}
        <FormSection
          title="Período e Localização"
          description="Datas e localização da formação"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              description="Deixe em branco se ainda em andamento"
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
              label="Localização"
              error={errors.location?.message}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("location")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Cidade, Estado"
                />
              </div>
            </FormField>
          </div>

          <FormField
            label="GPA/Nota (Opcional)"
            error={errors.gpa?.message}
            description="Nota final ou GPA, se aplicável"
          >
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Award className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                {...register("gpa")}
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Ex: 8.5/10, 3.8/4.0"
              />
            </div>
          </FormField>
        </FormSection>

        {/* Descrição */}
        <FormSection
          title="Descrição Detalhada"
          description="Descrição completa da formação, currículo e experiências"
        >
          <FormField
            label="Conteúdo da Descrição"
            error={errors.description?.message}
            required
          >
            <RichTextEditor
              content={description}
              onChange={handleDescriptionChange}
              placeholder="Descreva detalhadamente a formação, disciplinas relevantes, projetos desenvolvidos..."
              minHeight="250px"
            />
          </FormField>
        </FormSection>

        {/* Conquistas e Certificado */}
        <FormSection
          title="Conquistas e Certificado"
          description="Conquistas específicas e imagem do certificado"
        >
          <FormField
            label="Conquistas e Destaques"
            description="Adicione conquistas, prêmios ou destaques específicos"
          >
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Digite uma conquista ou destaque"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                />
                <Button type="button" onClick={handleAddAchievement} variant="outline">
                  Adicionar
                </Button>
              </div>
              
              {achievements.length > 0 && (
                <div className="space-y-2">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <span className="text-sm text-foreground">{achievement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAchievement(index)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="URL de Verificação"
              error={errors.verificationUrl?.message}
              description="Link para verificação do certificado (opcional)"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("verificationUrl")}
                  type="url"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="https://exemplo.com/verificacao"
                />
              </div>
            </FormField>

            <FormField
              label="Status"
              description="Ativar/desativar este modal"
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground">Modal ativo</span>
              </label>
            </FormField>
          </div>

          <FormField
            label="Imagem do Certificado"
            description="Upload da imagem do certificado ou diploma (opcional)"
          >
            <div className="space-y-4">
              {certificateImageUrl && (
                <div className="relative inline-block">
                  <img
                    src={certificateImageUrl}
                    alt="Certificado"
                    className="max-w-xs h-auto rounded-lg border border-border shadow-sm"
                  />
                </div>
              )}
              
              <ImageUploader
                onUpload={handleCertificateUpload}
                category="certificates"
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
              >
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {certificateImageUrl ? "Alterar Certificado" : "Adicionar Certificado"}
                </Button>
              </ImageUploader>
            </div>
          </FormField>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}