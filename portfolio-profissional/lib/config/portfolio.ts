import { PortfolioConfig } from '../types/portfolio';

export const portfolioConfig: PortfolioConfig = {
  personal: {
    name: "Gilberto Nascimento",
    title: "Engenheiro de Processos",
    description: "Dedicado a transformar método em prática e risco em prevenção.",
    email: "seuemail@exemplo.com",
    phone: "+55 (11) 99881-0297",
    location: "São Paulo, Brasil",
  },

  about: "Desenvolvedor com mais de 5 anos de experiência em tecnologias web modernas. Especializado em React, Node.js e desenvolvimento de aplicações escaláveis.",

  skills: [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", 
    "Python", "PostgreSQL", "MongoDB", "AWS", "Docker"
  ],

  projects: [
    {
      id: "ecommerce-platform",
      title: "E-commerce Platform",
      description: "Plataforma completa de e-commerce com painel administrativo",
      longDescription: "Uma plataforma completa de e-commerce desenvolvida com React e Node.js, incluindo sistema de pagamentos, gerenciamento de produtos, painel administrativo e dashboard de analytics.",
      technologies: ["React", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com/seuusuario/projeto1",
      demoUrl: "https://projeto1.com",
      featured: true,
      category: "Web Development",
      completedAt: "2024-01-15"
    },
    {
      id: "task-management-app",
      title: "Task Management App",
      description: "Aplicativo de gerenciamento de tarefas com colaboração em tempo real",
      longDescription: "Aplicativo de produtividade com funcionalidades de colaboração em tempo real, notificações push, sincronização offline e integração com calendários.",
      technologies: ["Next.js", "Socket.io", "MongoDB"],
      githubUrl: "https://github.com/seuusuario/projeto2",
      demoUrl: "https://projeto2.com",
      featured: true,
      category: "Productivity",
      completedAt: "2023-11-20"
    },
    {
      id: "data-analytics-dashboard",
      title: "Data Analytics Dashboard",
      description: "Dashboard interativo para análise de dados com visualizações dinâmicas",
      longDescription: "Dashboard avançado para análise de dados com gráficos interativos, relatórios customizáveis e integração com múltiplas fontes de dados.",
      technologies: ["React", "D3.js", "Python"],
      githubUrl: "https://github.com/seuusuario/projeto3",
      demoUrl: "https://projeto3.com",
      featured: false,
      category: "Data Science",
      completedAt: "2023-08-10"
    }
  ],

  experience: [
    {
      id: "tech-company-senior",
      company: "Tech Company",
      position: "Senior Developer",
      period: "2022 - Presente",
      description: "Desenvolvimento de aplicações web escaláveis e liderança técnica de equipe.",
      startDate: "2022-03-01"
    },
    {
      id: "startup-fullstack",
      company: "Startup Inc",
      position: "Full Stack Developer",
      period: "2020 - 2022",
      description: "Desenvolvimento completo de produtos digitais do zero ao deploy.",
      startDate: "2020-06-15",
      endDate: "2022-02-28"
    }
  ],

  education: [
    {
      id: "computer-science-degree",
      institution: "Universidade de São Paulo",
      degree: "Bacharelado",
      field: "Ciência da Computação",
      startDate: "2016-02-01",
      endDate: "2019-12-15",
      description: "Formação sólida em algoritmos, estruturas de dados, engenharia de software e desenvolvimento web.",
      gpa: "8.5/10",
      achievements: [
        "Projeto de conclusão premiado",
        "Monitor de Programação Web",
        "Participação em hackathons"
      ]
    },
    {
      id: "aws-certification",
      institution: "Amazon Web Services",
      degree: "Certificação",
      field: "AWS Solutions Architect",
      startDate: "2023-01-15",
      endDate: "2023-02-20",
      description: "Certificação em arquitetura de soluções na nuvem AWS.",
      verificationUrl: "https://aws.amazon.com/verification/example"
    }
  ],

  testimonials: [
    {
      id: "testimonial-1",
      name: "Maria Silva",
      position: "Product Manager",
      company: "Tech Company",
      content: "Gilberto é um desenvolvedor excepcional. Sua capacidade de transformar ideias complexas em soluções elegantes é impressionante. Trabalhar com ele foi uma experiência fantástica.",
      date: "2024-01-15",
      linkedinUrl: "https://linkedin.com/in/mariasilva"
    },
    {
      id: "testimonial-2",
      name: "João Santos",
      position: "CTO",
      company: "Startup Inc",
      content: "Durante nosso tempo trabalhando juntos, Gilberto demonstrou não apenas excelência técnica, mas também liderança e capacidade de mentoria. Recomendo sem hesitação.",
      date: "2023-12-10",
      linkedinUrl: "https://linkedin.com/in/joaosantos"
    },
    {
      id: "testimonial-3",
      name: "Ana Costa",
      position: "Designer UX/UI",
      company: "Design Studio",
      content: "A colaboração com Gilberto foi perfeita. Ele entende profundamente tanto o lado técnico quanto a experiência do usuário, criando produtos que realmente funcionam.",
      date: "2023-10-05",
      linkedinUrl: "https://linkedin.com/in/anacosta"
    }
  ],

  social: {
    github: "https://github.com/seuusuario",
    linkedin: "https://linkedin.com/in/seuusuario",
    twitter: "https://twitter.com/seuusuario",
    website: "https://seusite.com"
  },

  seo: {
    title: "Gilberto Nascimento - Engenheiro de Manufatura & Desenvolvedor",
    description: "Portfolio profissional de Gilberto Nascimento, engenheiro de manufatura especializado em soluções digitais inovadoras e desenvolvimento web moderno.",
    keywords: [
      "desenvolvedor",
      "engenheiro",
      "manufatura",
      "react",
      "next.js",
      "typescript",
      "node.js",
      "portfolio",
      "são paulo"
    ],
    ogImage: "/og-image.jpg",
    twitterHandle: "@seuusuario"
  }
};