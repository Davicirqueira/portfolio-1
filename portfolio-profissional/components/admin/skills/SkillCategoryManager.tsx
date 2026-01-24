"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { SkillCategory } from "@/lib/types/portfolio"
import { Tag, Palette } from "lucide-react"

// Schema de validação para categoria de habilidade
const categorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório").max(100, "Nome muito longo"),
  description: z.string().optional(),
  color: z.enum(["blue", "green", "purple", "orange", "red"]).default("blue"),
  icon: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface SkillCategoryManagerProps {
  category: SkillCategory | null
  onSave: (data: Omit<SkillCategory, 'id'>) => void
  onCancel: () => void
}

const categoryColors = [
  { value: "blue", label: "Azul", class: "bg-blue-500", lightClass: "bg-blue-100 border-blue-200" },
  { value: "green", label: "Verde", class: "bg-green-500", lightClass: "bg-green-100 border-green-200" },
  { value: "purple", label: "Roxo", class: "bg-purple-500", lightClass: "bg-purple-100 border-purple-200" },
  { value: "orange", label: "Laranja", class: "bg-orange-500", lightClass: "bg-orange-100 border-orange-200" },
  { value: "red", label: "Vermelho", class: "bg-red-500", lightClass: "bg-red-100 border-red-200" }
]

const categoryIcons = [
  { value: "code", label: "Código", icon: "💻" },
  { value: "design", label: "Design", icon: "🎨" },
  { value: "tools", label: "Ferramentas", icon: "🔧" },
  { value: "language", label: "Linguagens", icon: "📝" },
  { value: "framework", label: "Frameworks", icon: "⚡" },
  { value: "database", label: "Banco de Dados", icon: "🗄️" },
  { value: "cloud", label: "Cloud", icon: "☁️" },
  { value: "mobile", label: "Mobile", icon: "📱" },
  { value: "web", label: "Web", icon: "🌐" },
  { value: "ai", label: "IA/ML", icon: "🤖" },
  { value: "security", label: "Segurança", icon: "🔒" },
  { value: "devops", label: "DevOps", icon: "🚀" }
]

export function SkillCategoryManager({ category, onSave, onCancel }: SkillCategoryManagerProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "blue",
      icon: "code",
    },
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = form

  // Carrega os dados da categoria quando disponível
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        description: category.description || "",
        color: (category as any).color || "blue",
        icon: (category as any).icon || "code",
      })
    }
  }, [category, reset])

  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true)
    try {
      const categoryData = {
        name: data.name,
        description: data.description,
        skills: category?.skills || [],
        // Adiciona propriedades extras que podem ser úteis
        color: data.color,
        icon: data.icon,
      } as Omit<SkillCategory, 'id'>

      onSave(categoryData)
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedColor = watch("color")
  const selectedIcon = watch("icon")

  return (
    <AdminFormContainer
      title={category ? "Editar Categoria" : "Nova Categoria"}
      description="Configure os detalhes da categoria de habilidades"
      isSaving={isSaving}
      onSave={handleSubmit(onSubmit)}
      onCancel={onCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informações Básicas */}
        <FormSection
          title="Informações Básicas"
          description="Nome e descrição da categoria"
        >
          <FormField
            label="Nome da Categoria"
            error={errors.name?.message}
            required
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                {...register("name")}
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Ex: Frontend, Backend, Qualidade"
              />
            </div>
          </FormField>

          <FormField
            label="Descrição (Opcional)"
            error={errors.description?.message}
            description="Breve descrição sobre esta categoria de habilidades"
          >
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              placeholder="Descreva o tipo de habilidades desta categoria..."
            />
          </FormField>
        </FormSection>

        {/* Configurações Visuais */}
        <FormSection
          title="Configurações Visuais"
          description="Personalize a aparência da categoria"
        >
          <FormField
            label="Cor da Categoria"
            error={errors.color?.message}
            required
            description="Cor que será usada para destacar esta categoria"
          >
            <div className="grid grid-cols-5 gap-3">
              {categoryColors.map(color => (
                <label key={color.value} className="cursor-pointer">
                  <input
                    {...register("color")}
                    type="radio"
                    value={color.value}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedColor === color.value 
                      ? `${color.lightClass} border-current` 
                      : 'bg-muted border-border hover:border-primary/50'
                  }`}>
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-6 h-6 rounded-full ${color.class}`} />
                      <span className="text-xs font-medium text-foreground">
                        {color.label}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </FormField>

          <FormField
            label="Ícone da Categoria"
            error={errors.icon?.message}
            description="Ícone que representará esta categoria"
          >
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {categoryIcons.map(iconOption => (
                <label key={iconOption.value} className="cursor-pointer">
                  <input
                    {...register("icon")}
                    type="radio"
                    value={iconOption.value}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedIcon === iconOption.value 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted border-border hover:border-primary/50'
                  }`}>
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{iconOption.icon}</span>
                      <span className="text-xs font-medium text-foreground text-center">
                        {iconOption.label}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </FormField>
        </FormSection>

        {/* Preview */}
        <FormSection
          title="Preview"
          description="Visualização de como a categoria aparecerá"
        >
          <div className="p-6 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                categoryColors.find(c => c.value === selectedColor)?.lightClass || 'bg-blue-100 border-blue-200'
              }`}>
                <span className="text-2xl">
                  {categoryIcons.find(i => i.value === selectedIcon)?.icon || '💻'}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {watch("name") || "Nome da Categoria"}
                </h3>
                {watch("description") && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {watch("description")}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${
                    categoryColors.find(c => c.value === selectedColor)?.class || 'bg-blue-500'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {categoryColors.find(c => c.value === selectedColor)?.label || 'Azul'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FormSection>
      </form>
    </AdminFormContainer>
  )
}