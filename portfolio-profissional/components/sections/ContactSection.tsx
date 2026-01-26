'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Github, 
  Instagram, 
  Facebook, 
  Youtube, 
  Globe,
  Clock
} from 'lucide-react';
import { ContactInfo } from '@/lib/types/portfolio';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { SocialIcons } from '@/components/ui/SocialIcons';
import { cn } from '@/lib/utils';

interface ContactSectionProps {
  contactData: ContactInfo;
}

const socialIconMap = {
  linkedin: { icon: Linkedin, color: 'text-[#0A66C2]', label: 'LinkedIn' },
  twitter: { icon: Twitter, color: 'text-[#1DA1F2]', label: 'Twitter' },
  github: { icon: Github, color: 'text-[#333]', label: 'GitHub' },
  instagram: { icon: Instagram, color: 'text-[#E4405F]', label: 'Instagram' },
  facebook: { icon: Facebook, color: 'text-[#1877F2]', label: 'Facebook' },
  youtube: { icon: Youtube, color: 'text-[#FF0000]', label: 'YouTube' },
  website: { icon: Globe, color: 'text-[#10B981]', label: 'Website' }
};

export function ContactSection({ contactData }: ContactSectionProps) {
  const { email, phone, location, availability, social } = contactData;

  // Filter out empty social links
  const activeSocialLinks = Object.entries(social || {}).filter(([_, url]) => url && url.trim() !== '');

  return (
    <section id="contato" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <AnimatedSection direction="up">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Vamos Otimizar Seus Processos?
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6 sm:mb-8" />
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-2 leading-relaxed">
            Interessado em implementar metodologias de qualidade e otimização de processos? Vamos conversar sobre como posso contribuir em seus projetos e melhorias.
          </p>
        </AnimatedSection>
        
        {/* Availability Status */}
        {availability && (
          <AnimatedSection direction="up" delay={0.1}>
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                {availability}
              </div>
            </div>
          </AnimatedSection>
        )}
        
        {/* Social Icons */}
        <AnimatedSection direction="up" delay={0.2}>
          <div className="mb-8 sm:mb-12">
            <SocialIcons 
              email={email}
              linkedin={social?.linkedin}
              twitter={social?.twitter}
              iconSize="lg"
            />
          </div>
        </AnimatedSection>
        
        {/* Contact Info Cards */}
        <AnimatedSection direction="up" delay={0.4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {[
              { label: 'Email', value: email, Icon: Mail, color: 'text-[#EA4335]' },
              { label: 'Telefone', value: phone, Icon: Phone, color: 'text-[#0A66C2]' },
              { label: 'Localização', value: location, Icon: MapPin, color: 'text-[#1DA1F2]' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className={cn("flex justify-center mb-2 sm:mb-3", item.color)}>
                  <item.Icon size={28} strokeWidth={2} className="sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{item.label}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm break-words">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Additional Social Links */}
        {activeSocialLinks.length > 0 && (
          <AnimatedSection direction="up" delay={0.6}>
            <div className="mt-8 sm:mt-12">
              <h3 className="text-lg font-semibold text-foreground mb-6">Conecte-se Comigo</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {activeSocialLinks.map(([platform, url], index) => {
                  const socialConfig = socialIconMap[platform as keyof typeof socialIconMap];
                  if (!socialConfig) return null;

                  const { icon: Icon, color, label } = socialConfig;

                  return (
                    <motion.a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-card/80 transition-all duration-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Icon className={cn("w-5 h-5 transition-colors duration-200", color)} />
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                        {label}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
      
      {/* Background decoration - Hidden on mobile for better performance */}
      <motion.div
        className="absolute top-10 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/10 rounded-full blur-xl hidden sm:block"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 right-4 sm:right-10 w-20 sm:w-24 h-20 sm:h-24 bg-purple-500/10 rounded-full blur-xl hidden sm:block"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </section>
  );
}