// Portfolio Configuration Types

export interface AnimationConfig {
  hover: {
    scale: number;
    rotate: number;
    duration: number;
  };
  entrance: {
    fadeIn: boolean;
    slideDirection?: 'up' | 'down' | 'left' | 'right';
    duration: number;
  };
  subtle: {
    breathe: boolean; // Subtle breathing animation
    glow: boolean; // Subtle glow effect
  };
}

export interface PersonalInfo {
  name: string;
  title: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  profilePhoto?: string; // Path to professional photo for About section
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  featured: boolean;
  category: string;
  completedAt: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  startDate: string;
  endDate?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
  gpa?: string;
  achievements?: string[];
  verificationUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  linkedinUrl?: string;
  date: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  twitterHandle?: string;
}

export interface PortfolioConfig {
  personal: PersonalInfo;
  about: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  testimonials: Testimonial[];
  social: SocialLinks;
  seo: SEOConfig;
}
