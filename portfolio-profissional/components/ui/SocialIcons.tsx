'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Twitter } from 'lucide-react';

interface SocialIconsProps {
  email: string;
  linkedin?: string;
  twitter?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14'
};

const iconSizeMap = {
  sm: 20,
  md: 24,
  lg: 28
};

export function SocialIcons({ 
  email, 
  linkedin, 
  twitter, 
  className = '',
  iconSize = 'md'
}: SocialIconsProps) {
  const socialLinks = [
    {
      platform: 'gmail',
      icon: Mail,
      label: 'Gmail',
      href: `mailto:${email}`,
      ariaLabel: `Enviar email para ${email}`,
      color: 'hover:bg-[#EA4335] hover:text-white',
      show: true
    },
    {
      platform: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      href: linkedin,
      ariaLabel: 'Visitar perfil no LinkedIn',
      color: 'hover:bg-[#0A66C2] hover:text-white',
      show: !!linkedin
    },
    {
      platform: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      href: twitter,
      ariaLabel: 'Visitar perfil no Twitter',
      color: 'hover:bg-[#1DA1F2] hover:text-white',
      show: !!twitter
    }
  ].filter(link => link.show);

  return (
    <div className={`flex gap-4 md:gap-6 justify-center items-center ${className}`}>
      {socialLinks.map((link, index) => {
        const Icon = link.icon;
        const isExternal = link.platform !== 'gmail';
        
        return (
          <motion.a
            key={link.platform}
            href={link.href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            aria-label={link.ariaLabel}
            className={`
              ${sizeMap[iconSize]}
              flex items-center justify-center
              rounded-full
              bg-card border-2 border-border
              text-muted-foreground
              transition-all duration-300
              ${link.color}
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              cursor-pointer
            `}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
              }
            }}
            tabIndex={0}
          >
            <Icon size={iconSizeMap[iconSize]} strokeWidth={2} />
          </motion.a>
        );
      })}
    </div>
  );
}
