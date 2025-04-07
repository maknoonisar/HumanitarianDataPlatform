export interface Dataset {
  id: number;
  title: string;
  description: string;
  source: string;
  organizationId: number;
  location?: string;
  category?: string;
  tags?: string[];
  format?: string;
  lastUpdated?: Date;
  downloadCount?: number;
  fileUrl?: string;
}

export interface Organization {
  id: number;
  name: string;
  acronym?: string;
  description?: string;
  logoUrl?: string;
  datasetCount?: number;
}

export interface Crisis {
  id: number;
  name: string;
  description?: string;
  location?: string;
  tags?: string[];
  isActive?: boolean;
  datasetCount?: number;
}

export interface Statistics {
  id: number;
  datasetCount: number;
  organizationCount: number;
  locationCount: number;
  activeCrisisCount: number;
  lastUpdated?: Date;
}

export interface Visualization {
  id: number;
  title: string;
  description?: string;
  source?: string;
  datasetId?: number;
  visualizationType?: string;
  config?: Record<string, any>;
  createdAt?: Date;
}

export interface SearchFilters {
  category?: string;
  location?: string;
  format?: string;
  query?: string;
}
