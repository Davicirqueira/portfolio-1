// Analytics Types

export interface PageView {
  timestamp: string;
  userAgent: string;
  referrer?: string;
}

export interface SectionView {
  section: string;
  timestamp: string;
  timeSpent: number;
}

export interface ProjectClick {
  projectId: string;
  timestamp: string;
  action: 'github' | 'demo' | 'view';
}

export interface ContactSubmission {
  timestamp: string;
  success: boolean;
}

export interface AnalyticsData {
  pageViews: PageView[];
  sectionViews: SectionView[];
  projectClicks: ProjectClick[];
  contactSubmissions: ContactSubmission[];
}