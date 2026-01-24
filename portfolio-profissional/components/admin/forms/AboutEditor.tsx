"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { ImageUploader } from "@/components/admin/media/ImageUploader"
import { RichTextEditor } from "@/components/admin/ui/RichTextEditor"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { PersonalInfo } from "@/lib/types/portfolio"
import { Upload, User, FileText, ExternalLink } from "lucide-react"

// Schema de validação para a seção About
const aboutSchema = z.object({
  about: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres").max(2000, "Descrição muito longa"),
  profilePhoto: z.string().optional(),
  formacaoButtonText: z.string().min(1, "Texto do botão é obrigatório").max(50, "Texto muito longo"),
  formacaoButtonUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

type AboutFormData = z.infer<typeof aboutSchema>

export function AboutEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const [isSaving, setIsSaving] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("")
  const [aboutText, setAboutText] = useState<string>("")

  const form = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      about: "",
      profilePhoto: "",
      formacaoButtonText: "Ver Formação",
      formacaoButtonUrl: "",
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data) {
      const about = portfolioData.data.about || ""
      const personal = portfolioData.data.personal as PersonalInfo
      
      reset({
        about,
        profilePhoto: personal?.profilePhoto || "",
        formacaoButtonText: "Ver Formação",
        formacaoButtonUrl: "",
      })
      
      setAboutText(about)
      setProfilePhotoUrl(personal?.profilePhoto || "")
    }
  }, [portfolioData, reset])

  // Monitora mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      setDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDirty])

  const onSubmit = async (data: AboutFormData) => {
    setIsSaving(true)
    try {
      const updatedData = {
        ...portfolioData?.data,
        about: aboutText,
        personal: {
          ...portfolioData?.data?.personal,
          profilePhoto: profilePhotoUrl,
        },
      }

      const success = await saveData(updatedData)
      if (success) {
        setDirty(false)
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (portfolioData?.data) {
      const about = portfolioData.data.about || ""
      const personal = portfolioData.data.personal as PersonalInfo
      
      reset({
        about,
        profilePhoto: personal?.profilePhoto || "",
        formacaoButtonText: "Ver Formação",
        formacaoButtonUrl: "",
      })
      
      setAboutText(about)
      setProfilePhotoUrl(personal?.profilePhoto || "")
      setDirty(false)
    }
  }

  const handlePhotoUpload = (url: string) => {
    setProfilePhotoUrl(url)
    setValue("profilePhoto", url)
    setDirty(true)
  }

  const handleAboutTextChange = (content: string) => {
    setAboutText(content)
    setValue("about", content)
    setDirty(true)
  }

  return (
    <AdminFormContainer
      title="Seção Sobre"
      description="Configure o conteúdo da seção About do seu portfólio"
      isLoading={isLoading}
      isSaving={isSaving}
      isDirty={isDirty}
      onSave={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção de Foto de Perfil */}
        <FormSection
          title="Foto de Perfil"
          description="Imagem profissional que aparecerá na seção About (recomendado: 600x600px)"
        >
          <div className="flex flex-col items-center space-y-4">
            {profilePhotoUrl ? (
              <div className="relative group">
                <img
                  src={profilePhotoUrl}
                  alt="Foto de perfil profissional"
                  className="w-40 h-40 rounded-lg object-cover border-4 border-border shadow-lg"
                />
                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 rounded-lg bg-muted border-4 border-border flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            
            <ImageUploader
              onUpload={handlePhotoUpload}
              category="profile"
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            >
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                {profilePhotoUrl ? "Alterar Foto" : "Adicionar Foto"}
              </Button>
            </ImageUploader>
          </div>
        </FormSection>

        {/* Seção de Texto Sobre */}
        <FormSection
          title="Texto de Apresentação"
          description="Descrição detalhada sobre sua experiência, especialidades e trajetória profissional"
        >
          <FormField
            label="Conteúdo da Seção About"
            error={errors.about?.message}
            required
            description="Use formatação rica para destacar informações importantes. Mínimo 50 caracteres."
          >
            <RichTextEditor
              content={aboutText}
              onChange={handleAboutTextChange}
              placeholder="Escreva sobre sua experiência profissional, especialidades, trajetória e o que te motiva..."
              minHeight="300px"
            />
          </FormField>
        </FormSection>

        {/* Seção de Botão de Formação */}
        <FormSection
          title="Botão de Formação"
          description="Configure o botão que direcionará para informações detalhadas sobre sua formação"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Texto do Botão"
              error={errors.formacaoButtonText?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("formacaoButtonText")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ver Formação"
                />
              </div>
            </FormField>

            <FormField
              label="URL do Botão (Opcional)"
              error={errors.formacaoButtonUrl?.message}
              description="Link externo para currículo ou página de formação"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("formacaoButtonUrl")}
                  type="url"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="https://exemplo.com/curriculo"
                />
              </div>
            </FormField>
          </div>

          {/* Preview do Botão */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Preview do botão:</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              disabled
              className="pointer-events-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              {watch("formacaoButtonText") || "Ver Formação"}
            </Button>
          </div>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}