'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { usePortfolio } from '@/lib/hooks/usePortfolio';

export function TestimonialsSection() {
  const { testimonials } = usePortfolio();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (!testimonials.length) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection direction="up" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            O que Dizem Sobre Mim
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Feedback de clientes e colegas que trabalharam comigo
          </p>
        </AnimatedSection>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12 text-center relative"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {/* Quote icon */}
              <motion.div
                className="absolute top-6 left-6 text-primary/20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Quote className="w-8 h-8" />
              </motion.div>

              {/* Testimonial content */}
              <motion.blockquote
                className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                "{testimonials[currentIndex].content}"
              </motion.blockquote>

              {/* Author info */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4">
                  {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="text-lg font-semibold text-foreground">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-muted-foreground">
                  {testimonials[currentIndex].position} • {testimonials[currentIndex].company}
                </p>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-primary/10 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <motion.button
              onClick={prevTestimonial}
              className="p-3 bg-card border border-border rounded-full hover:bg-accent transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Testemunho anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                />
              ))}
            </div>

            <motion.button
              onClick={nextTestimonial}
              className="p-3 bg-card border border-border rounded-full hover:bg-accent transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Próximo testemunho"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}