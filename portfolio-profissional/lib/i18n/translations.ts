// Internationalization translations for the admin dashboard

export type Language = 'en' | 'pt';

export interface Translations {
  // Navigation
  navigation: {
    dashboard: string;
    home: string;
    about: string;
    skills: string;
    experience: string;
    projects: string;
    testimonials: string;
    contact: string;
    statistics: string;
    media: string;
    performance: string;
    security: string;
    settings: string;
    backup: string;
  };
  
  // Common actions
  actions: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    upload: string;
    download: string;
    preview: string;
    publish: string;
    refresh: string;
    search: string;
    filter: string;
    sort: string;
    clear: string;
    reset: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    previous: string;
  };
  
  // Form labels
  forms: {
    name: string;
    title: string;
    description: string;
    email: string;
    phone: string;
    website: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: string;
    category: string;
    tags: string;
    image: string;
    file: string;
    required: string;
    optional: string;
  };
  
  // Messages
  messages: {
    success: {
      saved: string;
      deleted: string;
      uploaded: string;
      published: string;
      updated: string;
    };
    error: {
      generic: string;
      network: string;
      validation: string;
      unauthorized: string;
      notFound: string;
      serverError: string;
    };
    confirmation: {
      delete: string;
      unsavedChanges: string;
      reset: string;
    };
  };
  
  // Accessibility
  accessibility: {
    skipToContent: string;
    skipToNavigation: string;
    openMenu: string;
    closeMenu: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    required: string;
    optional: string;
    expandSection: string;
    collapseSection: string;
    sortAscending: string;
    sortDescending: string;
    currentPage: string;
    goToPage: string;
    previousPage: string;
    nextPage: string;
    firstPage: string;
    lastPage: string;
  };
  
  // Settings
  settings: {
    language: string;
    theme: string;
    accessibility: string;
    highContrast: string;
    reducedMotion: string;
    fontSize: string;
    screenReader: string;
    keyboardNavigation: string;
    autoSave: string;
    notifications: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    navigation: {
      dashboard: 'Dashboard',
      home: 'Home',
      about: 'About',
      skills: 'Skills',
      experience: 'Experience',
      projects: 'Projects',
      testimonials: 'Testimonials',
      contact: 'Contact',
      statistics: 'Statistics',
      media: 'Media',
      performance: 'Performance',
      security: 'Security',
      settings: 'Settings',
      backup: 'Backup',
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      upload: 'Upload',
      download: 'Download',
      preview: 'Preview',
      publish: 'Publish',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      clear: 'Clear',
      reset: 'Reset',
      confirm: 'Confirm',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
    },
    forms: {
      name: 'Name',
      title: 'Title',
      description: 'Description',
      email: 'Email',
      phone: 'Phone',
      website: 'Website',
      company: 'Company',
      position: 'Position',
      startDate: 'Start Date',
      endDate: 'End Date',
      current: 'Current',
      category: 'Category',
      tags: 'Tags',
      image: 'Image',
      file: 'File',
      required: 'Required',
      optional: 'Optional',
    },
    messages: {
      success: {
        saved: 'Changes saved successfully',
        deleted: 'Item deleted successfully',
        uploaded: 'File uploaded successfully',
        published: 'Content published successfully',
        updated: 'Content updated successfully',
      },
      error: {
        generic: 'An error occurred',
        network: 'Network error. Please check your connection.',
        validation: 'Please check the form for errors',
        unauthorized: 'You are not authorized to perform this action',
        notFound: 'The requested resource was not found',
        serverError: 'Server error. Please try again later.',
      },
      confirmation: {
        delete: 'Are you sure you want to delete this item?',
        unsavedChanges: 'You have unsaved changes. Do you want to save them?',
        reset: 'Are you sure you want to reset all settings?',
      },
    },
    accessibility: {
      skipToContent: 'Skip to main content',
      skipToNavigation: 'Skip to navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      required: 'Required field',
      optional: 'Optional field',
      expandSection: 'Expand section',
      collapseSection: 'Collapse section',
      sortAscending: 'Sort ascending',
      sortDescending: 'Sort descending',
      currentPage: 'Current page',
      goToPage: 'Go to page',
      previousPage: 'Previous page',
      nextPage: 'Next page',
      firstPage: 'First page',
      lastPage: 'Last page',
    },
    settings: {
      language: 'Language',
      theme: 'Theme',
      accessibility: 'Accessibility',
      highContrast: 'High Contrast',
      reducedMotion: 'Reduced Motion',
      fontSize: 'Font Size',
      screenReader: 'Screen Reader',
      keyboardNavigation: 'Keyboard Navigation',
      autoSave: 'Auto Save',
      notifications: 'Notifications',
    },
  },
  pt: {
    navigation: {
      dashboard: 'Dashboard',
      home: 'Início',
      about: 'Sobre',
      skills: 'Habilidades',
      experience: 'Experiência',
      projects: 'Projetos',
      testimonials: 'Depoimentos',
      contact: 'Contato',
      statistics: 'Estatísticas',
      media: 'Mídia',
      performance: 'Performance',
      security: 'Segurança',
      settings: 'Configurações',
      backup: 'Backup',
    },
    actions: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      remove: 'Remover',
      upload: 'Enviar',
      download: 'Baixar',
      preview: 'Visualizar',
      publish: 'Publicar',
      refresh: 'Atualizar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      clear: 'Limpar',
      reset: 'Redefinir',
      confirm: 'Confirmar',
      close: 'Fechar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
    },
    forms: {
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
      email: 'E-mail',
      phone: 'Telefone',
      website: 'Website',
      company: 'Empresa',
      position: 'Cargo',
      startDate: 'Data de Início',
      endDate: 'Data de Fim',
      current: 'Atual',
      category: 'Categoria',
      tags: 'Tags',
      image: 'Imagem',
      file: 'Arquivo',
      required: 'Obrigatório',
      optional: 'Opcional',
    },
    messages: {
      success: {
        saved: 'Alterações salvas com sucesso',
        deleted: 'Item excluído com sucesso',
        uploaded: 'Arquivo enviado com sucesso',
        published: 'Conteúdo publicado com sucesso',
        updated: 'Conteúdo atualizado com sucesso',
      },
      error: {
        generic: 'Ocorreu um erro',
        network: 'Erro de rede. Verifique sua conexão.',
        validation: 'Verifique o formulário para erros',
        unauthorized: 'Você não tem autorização para esta ação',
        notFound: 'O recurso solicitado não foi encontrado',
        serverError: 'Erro do servidor. Tente novamente mais tarde.',
      },
      confirmation: {
        delete: 'Tem certeza que deseja excluir este item?',
        unsavedChanges: 'Você tem alterações não salvas. Deseja salvá-las?',
        reset: 'Tem certeza que deseja redefinir todas as configurações?',
      },
    },
    accessibility: {
      skipToContent: 'Pular para o conteúdo principal',
      skipToNavigation: 'Pular para a navegação',
      openMenu: 'Abrir menu',
      closeMenu: 'Fechar menu',
      loading: 'Carregando',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      required: 'Campo obrigatório',
      optional: 'Campo opcional',
      expandSection: 'Expandir seção',
      collapseSection: 'Recolher seção',
      sortAscending: 'Ordenar crescente',
      sortDescending: 'Ordenar decrescente',
      currentPage: 'Página atual',
      goToPage: 'Ir para página',
      previousPage: 'Página anterior',
      nextPage: 'Próxima página',
      firstPage: 'Primeira página',
      lastPage: 'Última página',
    },
    settings: {
      language: 'Idioma',
      theme: 'Tema',
      accessibility: 'Acessibilidade',
      highContrast: 'Alto Contraste',
      reducedMotion: 'Movimento Reduzido',
      fontSize: 'Tamanho da Fonte',
      screenReader: 'Leitor de Tela',
      keyboardNavigation: 'Navegação por Teclado',
      autoSave: 'Salvamento Automático',
      notifications: 'Notificações',
    },
  },
};