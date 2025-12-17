'use client';

import React from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useContactForm } from '@/lib/hooks/useContactForm';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    isSubmitting,
    isSuccess,
    error,
    submitForm,
    reset,
  } = useContactForm();

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto text-center" padding="lg">
        <div className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Mensagem Enviada!
            </h3>
            <p className="text-muted-foreground mb-4">
              Obrigado pelo contato! Responderei em breve.
            </p>
            <Button 
              onClick={reset}
              variant="outline"
              size="md"
            >
              Enviar Nova Mensagem
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto" padding="lg">
      <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Entre em Contato
          </h3>
          <p className="text-muted-foreground">
            Interessado em trabalhar juntos? Vamos conversar sobre seu próximo projeto!
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nome"
            placeholder="Seu nome completo"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />
        </div>

        <Input
          label="Assunto"
          placeholder="Sobre o que você gostaria de conversar?"
          error={errors.subject?.message}
          required
          {...register('subject')}
        />

        <Textarea
          label="Mensagem"
          placeholder="Conte-me mais sobre seu projeto ou ideia..."
          rows={6}
          error={errors.message?.message}
          helperText="Mínimo de 10 caracteres"
          required
          {...register('message')}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            disabled={isSubmitting}
            size="lg"
          >
            Limpar Formulário
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Ou entre em contato diretamente pelo email:{' '}
            <a 
              href="mailto:seuemail@exemplo.com"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              seuemail@exemplo.com
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}