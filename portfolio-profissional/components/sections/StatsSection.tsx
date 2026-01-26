'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { Statistic } from '@/lib/types/portfolio';

export function StatsSection() {
  const { statistics } = usePortfolio();
  
  // Use dynamic statistics from portfolio data, fallback to default if not available
  const stats: Statistic[] = statistics || [
    {
      id: "pfmeas-developed",
      label: 'PFMEAs Desenvolvidos',
      value: 50,
      suffix: '+',
      order: 1
    },
    {
      id: "years-experience", 
      label: 'Anos de Experiência',
      value: 8,
      suffix: '+',
      order: 2
    },
    {
      id: "apqp-projects",
      label: 'Projetos APQP',
      value: 30,
      suffix: '+',
      order: 3
    },
    {
      id: "quality-compliance",
      label: 'Conformidade Qualidade',
      value: 98,
      suffix: '%',
      order: 4
    }
  ];

  // Sort statistics by order if available
  const sortedStats = stats.sort((a: Statistic, b: Statistic) => (a.order || 0) - (b.order || 0));

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection direction="up" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Números que Falam por Si
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Alguns números que representam minha trajetória em engenharia de processos e qualidade automotiva.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {sortedStats.map((stat: Statistic, index: number) => (
            <motion.div
              key={stat.id}
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  className="text-4xl md:text-5xl font-bold text-primary block"
                  duration={2 + index * 0.2}
                />
                
                {/* Decorative circle */}
                <motion.div
                  className="absolute -inset-4 rounded-full border-2 border-primary/20"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 1, 
                    delay: index * 0.1 + 0.5,
                    type: 'spring',
                    stiffness: 100
                  }}
                />
              </div>
              
              <motion.p
                className="text-sm md:text-base text-muted-foreground mt-4 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
              >
                {stat.label}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-primary/5 to-purple-500/5"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}