'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Award, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { Education } from '@/lib/types/portfolio';

interface EducationModalProps {
  educationData: Education[];
  isOpen: boolean;
  onClose: () => void;
}

export function EducationModal({ educationData, isOpen, onClose }: EducationModalProps) {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      // Garantir que o scroll seja sempre restaurado
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPeriod = (startDate: string, endDate?: string) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Presente';
    return `${start} - ${end}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <motion.h2 
                    className="text-2xl font-bold text-foreground flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Award className="w-6 h-6 text-primary" />
                    Formação Acadêmica e Profissional
                  </motion.h2>
                  <motion.p 
                    className="text-sm text-muted-foreground mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    Histórico educacional e certificações profissionais
                  </motion.p>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-all duration-150"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 90,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-8">
                  {educationData.map((education, index) => (
                    <motion.div
                      key={education.id}
                      className="relative bg-muted/30 border border-border/50 rounded-lg p-6"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.01, 
                        y: -2,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                    >
                      {/* Institution and Degree */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div className="flex-1">
                          <motion.h3 
                            className="text-xl font-bold text-foreground mb-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            {education.institution}
                          </motion.h3>
                          <motion.div 
                            className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + index * 0.1 }}
                          >
                            <span className="text-primary font-semibold">
                              {education.degree}
                            </span>
                            <span className="hidden sm:block text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {education.field}
                            </span>
                          </motion.div>
                        </div>
                        
                        <motion.div 
                          className="flex items-center gap-2 text-muted-foreground mt-2 md:mt-0 bg-card/50 px-3 py-1 rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <Calendar className="w-4 h-4" />
                          {formatPeriod(education.startDate, education.endDate)}
                        </motion.div>
                      </div>

                      {/* GPA */}
                      {education.gpa && (
                        <motion.div 
                          className="mb-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 + index * 0.1 }}
                        >
                          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            <Award className="w-4 h-4" />
                            CRA: {education.gpa}
                          </div>
                        </motion.div>
                      )}

                      {/* Description */}
                      {education.description && (
                        <motion.p 
                          className="text-muted-foreground leading-relaxed mb-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          {education.description}
                        </motion.p>
                      )}

                      {/* Achievements */}
                      {education.achievements && education.achievements.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.65 + index * 0.1 }}
                        >
                          <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            🏆 Principais Conquistas
                          </h4>
                          <div className="grid gap-2">
                            {education.achievements.map((achievement, achievementIndex) => (
                              <motion.div
                                key={achievementIndex}
                                className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 + achievementIndex * 0.05 }}
                                whileHover={{ 
                                  x: 8, 
                                  backgroundColor: 'hsl(var(--primary) / 0.08)',
                                  transition: { duration: 0.12, ease: "easeOut" }
                                }}
                              >
                                <motion.div 
                                  className="w-2 h-2 bg-primary rounded-full flex-shrink-0"
                                  whileHover={{ 
                                    scale: 1.2,
                                    transition: { duration: 0.15 }
                                  }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {achievement}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Verification URL */}
                      {education.verificationUrl && (
                        <motion.div 
                          className="mt-4 pt-4 border-t border-border/50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.75 + index * 0.1 }}
                        >
                          <motion.a
                            href={education.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                            whileHover={{ 
                              scale: 1.02,
                              transition: { duration: 0.15 }
                            }}
                            whileTap={{ 
                              scale: 0.98,
                              transition: { duration: 0.1 }
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Verificar Certificação
                          </motion.a>
                        </motion.div>
                      )}

                      {/* Hover effect overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg opacity-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Footer message */}
                <motion.div
                  className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + educationData.length * 0.1 }}
                >
                  <p className="text-sm text-muted-foreground">
                    Formação contínua e atualização constante são fundamentais para a excelência profissional.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}