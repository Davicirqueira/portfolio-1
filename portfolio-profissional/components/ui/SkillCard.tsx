'use client';

import { motion } from 'framer-motion';
import { EnhancedSkill } from '@/lib/types/portfolio';

interface SkillCardProps {
  skill: EnhancedSkill;
  onClick: (skill: EnhancedSkill) => void;
  index: number;
}

// Cor única elegante para todos os cards - tom slate/azul acinzentado elegante
const UNIFIED_CARD_STYLE = {
  gradient: 'from-slate-500/10 via-slate-600/15 to-slate-700/10',
  border: 'border-slate-500/20',
  hoverGradient: 'from-slate-400/15 via-slate-500/20 to-slate-600/15'
};

export function SkillCard({ skill, onClick, index }: SkillCardProps) {
  const handleClick = () => {
    onClick(skill);
  };

  // Fallback para dados ausentes
  if (!skill || !skill.name) {
    return (
      <motion.div
        className="skill-card-uniform bg-card border border-border rounded-xl p-6 cursor-not-allowed opacity-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="skill-card-content items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Dados da competência não disponíveis
          </p>
        </div>
      </motion.div>
    );
  }

  // Get color scheme based on index instead of category
  const colorScheme = UNIFIED_CARD_STYLE;

  const getExpertiseBadgeColor = (level: string) => {
    switch (level) {
      case 'Specialist':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'Expert':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'Advanced':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <motion.div
      className={`skill-card-uniform bg-gradient-to-br ${colorScheme.gradient} border ${colorScheme.border} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="skill-card-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Ver detalhes sobre ${skill.name}`}
        aria-describedby={`skill-description-${skill.id}`}
      >
        {/* Header with skill name and expertise badge */}
        <div className="flex items-start justify-between mb-3">
          <motion.h3 
            className="text-lg font-bold text-foreground leading-tight flex-1"
            whileHover={{ color: 'hsl(var(--primary))' }}
            transition={{ duration: 0.2 }}
          >
            {skill.name}
          </motion.h3>
          
          <motion.span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getExpertiseBadgeColor(skill.expertiseLevel)}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.1 }}
          >
            {skill.expertiseLevel}
          </motion.span>
        </div>

        {/* Category */}
        <motion.p 
          className="text-sm text-muted-foreground mb-3 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
        >
          {skill.category}
        </motion.p>

        {/* Description with uniform height */}
        <motion.p 
          id={`skill-description-${skill.id}`}
          className="skill-card-description text-sm text-muted-foreground leading-relaxed mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        >
          {skill.description}
        </motion.p>

        {/* Footer with experience years */}
        <motion.div 
          className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        >
          <span className="text-xs text-muted-foreground">
            {skill.yearsOfExperience} anos de experiência
          </span>
          
          <motion.div
            className="text-primary text-sm font-medium"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
          >
            Ver detalhes →
          </motion.div>
        </motion.div>

        {/* Hover effect overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${colorScheme.hoverGradient} rounded-xl opacity-0 pointer-events-none`}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}