"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { ImageUploader } from "@/components/admin/media/ImageUploader"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { PersonalInfo } from "@/lib/types/portfolio"
import { Upload, User, Mail, Phone, MapPin } from "lucide-react"

// Schema de validação para a seção Home
const homeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  profilePhoto: z.string().optional(),
})

type HomeFormData = z.infer<typeof homeSchema>

export function HomeEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const [isSaving, setIsSaving] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("")

  const form = useForm<HomeFormData>({
    resolver: zodResolver(homeSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      email: "",
      phone: "",
      location: "",
      profilePhoto: "",
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data?.personal) {
      const personal = portfolioData.data.personal as PersonalInfo
      reset({
        name: personal.name || "",
        title: personal.title || "",
        description: personal.description || "",
        email: personal.email || "",
        phone: personal.phone || "",
        location: personal.location || "",
        profilePhoto: personal.profilePhoto || "",
      })
      setProfilePhotoUrl(personal.profilePhoto || "")
    }
  }, [portfolioData, reset])

  // Monitora mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      setDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDirty])

  const onSubmit = async (data: HomeFormData) => {
    setIsSaving(true)
    try {
      const updatedData = {
        ...portfolioData?.data,
        personal: {
          ...portfolioData?.data?.personal,
          ...data,
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
    if (portfolioData?.data?.personal) {
      const personal = portfolioData.data.personal as PersonalInfo
      reset({
        name: personal.name || "",
        title: personal.title || "",
        description: personal.description || "",
        email: personal.email || "",
        phone: personal.phone || "",
        location: personal.location || "",
        profilePhoto: personal.profilePhoto || "",
      })
      setProfilePhotoUrl(personal.profilePhoto || "")
      setDirty(false)
    }
  }

  const handlePhotoUpload = (url: string) => {
    setProfilePhotoUrl(url)
    setValue("profilePhoto", url)
    setDirty(true)
  }

  return (
    <AdminFormContainer
      title="Informações Pessoais"
      description="Configure as informações principais que aparecerão na seção Home do seu portfólio"
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
          description="Imagem que aparecerá na seção Home (recomendado: 400x400px)"
        >
          <div className="flex flex-col items-center space-y-4">
            {profilePhotoUrl ? (
              <div className="relative group">
                <img
                  src={profilePhotoUrl}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted border-4 border-border flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
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

        {/* Seção de Informações Básicas */}
        <FormSection
          title="Informações Básicas"
          description="Dados principais que aparecerão na apresentação"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nome Completo"
              error={errors.name?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
            </FormField>

            <FormField
              label="Título/Especialização"
              error={errors.title?.message}
              required
            >
              <input
                {...register("title")}
                type="text"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Ex: Engenheiro de Software"
              />
            </FormField>
          </div>

          <FormField
            label="Descrição/Tagline"
            error={errors.description?.message}
            required
            description="Breve descrição que aparecerá logo abaixo do seu nome"
          >
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              placeholder="Uma breve descrição sobre você e sua especialidade..."
            />
          </FormField>
        </FormSection>

        {/* Seção de Contato */}
        <FormSection
          title="Informações de Contato"
          description="Dados de contato que aparecerão na seção Home"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email"
              error={errors.email?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </FormField>

            <FormField
              label="Telefone"
              error={errors.phone?.message}
              required
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="+55 (11) 99999-9999"
                />
              </div>
            </FormField>
          </div>

          <FormField
            label="Localização"
            error={errors.location?.message}
            required
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                {...register("location")}
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Cidade, Estado, País"
              />
            </div>
          </FormField>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}