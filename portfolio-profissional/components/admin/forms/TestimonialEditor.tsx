"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AdminFormContainer, FormSection } from "@/components/admin/ui/AdminFormContainer"
import { FormField } from "@/components/admin/ui/FormField"
import { Button } from "@/components/ui/Button"
import { usePortfolioData } from "@/lib/hooks/usePortfolioData"
import { Testimonial } from "@/lib/types/portfolio"
import { Plus, Trash2, User, Building, Briefcase, MessageSquare, Calendar, ExternalLink } from "lucide-react"

// Schema de validação para depoimentos
const testimonialItemSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  position: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres").max(100, "Cargo muito longo"),
  company: z.string().min(2, "Empresa deve ter pelo menos 2 caracteres").max(100, "Empresa muito longa"),
  content: z.string().min(20, "Depoimento deve ter pelo menos 20 caracteres").max(1000, "Depoimento muito longo"),
  initials: z.string().max(3, "Iniciais devem ter no máximo 3 caracteres").optional(),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  date: z.string().min(1, "Data é obrigatória"),
})

const testimonialsSchema = z.object({
  testimonials: z.array(testimonialItemSchema),
})

type TestimonialsFormData = z.infer<typeof testimonialsSchema>

export function TestimonialEditor() {
  const { portfolioData, isLoading, saveData, isDirty, setDirty } = usePortfolioData()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<TestimonialsFormData>({
    resolver: zodResolver(testimonialsSchema),
    defaultValues: {
      testimonials: [],
    },
  })

  const { control, register, handleSubmit, formState: { errors }, watch, setValue, reset } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "testimonials",
  })

  // Carrega os dados quando disponíveis
  useEffect(() => {
    if (portfolioData?.data?.testimonials) {
      const testimonials = portfolioData.data.testimonials as Testimonial[]
      reset({
        testimonials: testimonials.map(testimonial => ({
          ...testimonial,
          linkedinUrl: testimonial.linkedinUrl || "",
        })),
      })
    }
  }, [portfolioData, reset])

  // Monitora mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      setDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDirty])

  // Função para gerar iniciais automaticamente
  const generateInitials = (name: string): string => {
    return name
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3)
  }

  const onSubmit = async (data: TestimonialsFormData) => {
    setIsSaving(true)
    try {
      // Processa os depoimentos para garantir que as iniciais sejam geradas
      const processedTestimonials = data.testimonials.map(testimonial => ({
        ...testimonial,
        initials: testimonial.initials || generateInitials(testimonial.name),
        linkedinUrl: testimonial.linkedinUrl || undefined,
      }))

      const updatedData = {
        ...portfolioData?.data,
        testimonials: processedTestimonials,
      }

      const success = await saveData(updatedData)
      if (success) {
        setDirty(false)
      }
    } catch (error) {
      console.error("Erro ao salvar depoimentos:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (portfolioData?.data?.testimonials) {
      const testimonials = portfolioData.data.testimonials as Testimonial[]
      reset({
        testimonials: testimonials.map(testimonial => ({
          ...testimonial,
          linkedinUrl: testimonial.linkedinUrl || "",
        })),
      })
      setDirty(false)
    }
  }

  const addTestimonial = () => {
    const newId = `testimonial-${Date.now()}`
    const currentDate = new Date().toISOString().split('T')[0]
    append({
      id: newId,
      name: "",
      position: "",
      company: "",
      content: "",
      initials: "",
      linkedinUrl: "",
      date: currentDate,
    })
    setDirty(true)
  }

  const removeTestimonial = (index: number) => {
    remove(index)
    setDirty(true)
  }

  const handleNameChange = (index: number, name: string) => {
    setValue(`testimonials.${index}.name`, name)
    // Gera iniciais automaticamente quando o nome muda
    const initials = generateInitials(name)
    setValue(`testimonials.${index}.initials`, initials)
    setDirty(true)
  }

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }

  return (
    <AdminFormContainer
      title="Depoimentos de Clientes"
      description="Gerencie os depoimentos e feedback profissional que aparecerão no seu portfólio"
      isLoading={isLoading}
      isSaving={isSaving}
      isDirty={isDirty}
      onSave={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      className="animate-fade-in-up"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Gerenciar Depoimentos"
          description="Adicione, edite e organize os depoimentos de clientes e colegas de trabalho"
        >
          <div className="space-y-6">
            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum depoimento adicionado ainda
                </p>
                <Button type="button" onClick={addTestimonial} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Depoimento
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-card border border-border rounded-lg p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <h4 className="font-medium text-foreground">
                            Depoimento {index + 1}
                          </h4>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestimonial(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormField
                          label="Nome do Cliente"
                          error={errors.testimonials?.[index]?.name?.message}
                          required
                        >
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <input
                              {...register(`testimonials.${index}.name`)}
                              type="text"
                              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                              placeholder="Nome completo do cliente"
                              onChange={(e) => handleNameChange(index, e.target.value)}
                            />
                          </div>
                        </FormField>

                        <FormField
                          label="Cargo"
                          error={errors.testimonials?.[index]?.position?.message}
                          required
                        >
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Briefcase className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <input
                              {...register(`testimonials.${index}.position`)}
                              type="text"
                              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                              placeholder="Cargo do cliente"
                            />
                          </div>
                        </FormField>

                        <FormField
                          label="Empresa"
                          error={errors.testimonials?.[index]?.company?.message}
                          required
                        >
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Building className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <input
                              {...register(`testimonials.${index}.company`)}
                              type="text"
                              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                              placeholder="Nome da empresa"
                            />
                          </div>
                        </FormField>

                        <FormField
                          label="Data"
                          error={errors.testimonials?.[index]?.date?.message}
                          required
                        >
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <input
                              {...register(`testimonials.${index}.date`)}
                              type="date"
                              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            />
                          </div>
                        </FormField>
                      </div>

                      <FormField
                        label="Depoimento"
                        error={errors.testimonials?.[index]?.content?.message}
                        required
                        description="O texto completo do depoimento do cliente"
                      >
                        <textarea
                          {...register(`testimonials.${index}.content`)}
                          rows={4}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                          placeholder="Digite o depoimento completo do cliente..."
                        />
                      </FormField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          label="Iniciais"
                          error={errors.testimonials?.[index]?.initials?.message}
                          description="Geradas automaticamente a partir do nome"
                        >
                          <input
                            {...register(`testimonials.${index}.initials`)}
                            type="text"
                            maxLength={3}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            placeholder="Ex: JS"
                          />
                        </FormField>

                        <FormField
                          label="LinkedIn (Opcional)"
                          error={errors.testimonials?.[index]?.linkedinUrl?.message}
                          description="URL do perfil LinkedIn do cliente"
                        >
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <input
                              {...register(`testimonials.${index}.linkedinUrl`)}
                              type="url"
                              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                              placeholder="https://linkedin.com/in/cliente"
                            />
                          </div>
                        </FormField>
                      </div>

                      {/* Hidden ID field */}
                      <input
                        {...register(`testimonials.${index}.id`)}
                        type="hidden"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button type="button" onClick={addTestimonial} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Depoimento
                  </Button>
                </div>
              </>
            )}
          </div>
        </FormSection>

        {/* Preview Section */}
        {fields.length > 0 && (
          <FormSection
            title="Visualização"
            description="Prévia de como os depoimentos aparecerão no portfólio"
          >
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="grid gap-6">
                {fields.map((field, index) => {
                  const watchedField = watch(`testimonials.${index}`)
                  const initials = watchedField.initials || generateInitials(watchedField.name || "")

                  return (
                    <div key={field.id} className="bg-background rounded-lg p-6 border border-border">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-lg font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1">
                          <blockquote className="text-foreground mb-4 italic">
                            "{watchedField.content || "Texto do depoimento aparecerá aqui..."}"
                          </blockquote>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {watchedField.name || "Nome do Cliente"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {watchedField.position || "Cargo"} • {watchedField.company || "Empresa"}
                              </p>
                            </div>
                            {watchedField.linkedinUrl && (
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </FormSection>
        )}
      </form>
    </AdminFormContainer>
  )
}