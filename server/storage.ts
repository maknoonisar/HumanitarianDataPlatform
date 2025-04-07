import {
  users,
  type User,
  type InsertUser,
  datasets,
  type Dataset,
  type InsertDataset,
  organizations,
  type Organization,
  type InsertOrganization,
  crises,
  type Crisis,
  type InsertCrisis,
  statistics,
  type Statistics,
  type InsertStatistics,
  visualizations,
  type Visualization,
  type InsertVisualization,
} from "@shared/schema";
import crypto from 'crypto';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Dataset methods
  getDatasets(limit?: number, offset?: number): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  getDatasetsByOrganization(organizationId: number): Promise<Dataset[]>;
  getDatasetsByCrisis(crisisId: number): Promise<Dataset[]>;
  getDatasetsByCategory(category: string): Promise<Dataset[]>;
  searchDatasets(query: string): Promise<Dataset[]>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  deleteDataset(id: number): Promise<boolean>;
  incrementDownloadCount(id: number): Promise<Dataset | undefined>;

  // Organization methods
  getOrganizations(limit?: number, offset?: number): Promise<Organization[]>;
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;

  // Crisis methods
  getCrises(
    active?: boolean,
    limit?: number,
    offset?: number,
  ): Promise<Crisis[]>;
  getCrisis(id: number): Promise<Crisis | undefined>;
  createCrisis(crisis: InsertCrisis): Promise<Crisis>;

  // Statistics methods
  getStatistics(): Promise<Statistics | undefined>;
  updateStatistics(statistics: InsertStatistics): Promise<Statistics>;

  // Visualization methods
  getVisualizations(limit?: number, offset?: number): Promise<Visualization[]>;
  getVisualization(id: number): Promise<Visualization | undefined>;
  createVisualization(
    visualization: InsertVisualization,
  ): Promise<Visualization>;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private datasetsStore: Map<number, Dataset>;
  private organizationsStore: Map<number, Organization>;
  private crisesStore: Map<number, Crisis>;
  private statisticsStore: Map<number, Statistics>;
  private visualizationsStore: Map<number, Visualization>;

  private userIdCounter: number;
  private datasetIdCounter: number;
  private organizationIdCounter: number;
  private crisisIdCounter: number;
  private statisticsIdCounter: number;
  private visualizationIdCounter: number;

  constructor() {
    this.usersStore = new Map();
    this.datasetsStore = new Map();
    this.organizationsStore = new Map();
    this.crisesStore = new Map();
    this.statisticsStore = new Map();
    this.visualizationsStore = new Map();

    this.userIdCounter = 1;
    this.datasetIdCounter = 1;
    this.organizationIdCounter = 1;
    this.crisisIdCounter = 1;
    this.statisticsIdCounter = 1;
    this.visualizationIdCounter = 1;

    // Create admin user first, then initialize sample data
    // Using crypto to hash the password like in auth.ts
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync('admin1234', salt, 10000, 64, 'sha512').toString('hex');
    
    const adminUser = {
      username: "admin",
      password: `${hashedPassword}:${salt}`,
      email: "admin@example.com",
      role: "admin",
      isActive: true,
      displayName: "Administrator",
      organization: "System",
      id: this.userIdCounter++,
      createdAt: new Date(),
    };
    this.usersStore.set(adminUser.id, adminUser);

    // Initialize sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.usersStore.set(id, user);
    return user;
  }

  // Dataset methods
  async getDatasets(
    limit: number = 100,
    offset: number = 0,
  ): Promise<Dataset[]> {
    return Array.from(this.datasetsStore.values())
      .sort(
        (a, b) =>
          (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0),
      )
      .slice(offset, offset + limit);
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    return this.datasetsStore.get(id);
  }

  async getDatasetsByOrganization(organizationId: number): Promise<Dataset[]> {
    return Array.from(this.datasetsStore.values()).filter(
      (dataset) => dataset.organizationId === organizationId,
    );
  }

  async getDatasetsByCrisis(crisisId: number): Promise<Dataset[]> {
    const crisis = this.crisesStore.get(crisisId);
    if (!crisis) return [];

    // Match datasets that have the same location as the crisis
    return Array.from(this.datasetsStore.values()).filter(
      (dataset) => dataset.location === crisis.location,
    );
  }

  async getDatasetsByCategory(category: string): Promise<Dataset[]> {
    return Array.from(this.datasetsStore.values()).filter(
      (dataset) => dataset.category === category,
    );
  }

  async searchDatasets(query: string): Promise<Dataset[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.datasetsStore.values()).filter(
      (dataset) =>
        dataset.title.toLowerCase().includes(lowerQuery) ||
        dataset.description.toLowerCase().includes(lowerQuery) ||
        dataset.location?.toLowerCase().includes(lowerQuery) ||
        dataset.category?.toLowerCase().includes(lowerQuery) ||
        dataset.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }

  async updateUserRole(
    userId: number,
    role: string,
  ): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    user.role = role;
    this.usersStore.set(userId, user);
    return user;
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = this.datasetIdCounter++;
    const dataset: Dataset = {
      ...insertDataset,
      id,
      downloadCount: 0,
      lastUpdated: new Date(),
    };
    this.datasetsStore.set(id, dataset);

    // Update organization dataset count
    const organization = this.organizationsStore.get(dataset.organizationId);
    if (organization) {
      organization.datasetCount = (organization.datasetCount || 0) + 1;
      this.organizationsStore.set(organization.id, organization);
    }

    // Update statistics
    this.updateStatisticsCounts();

    return dataset;
  }

  async deleteDataset(id: number): Promise<boolean> {
    const dataset = this.datasetsStore.get(id);
    if (!dataset) return false;
    
    // Delete the dataset
    this.datasetsStore.delete(id);
    
    // Update organization dataset count
    const organization = this.organizationsStore.get(dataset.organizationId);
    if (organization && organization.datasetCount && organization.datasetCount > 0) {
      organization.datasetCount -= 1;
      this.organizationsStore.set(organization.id, organization);
    }
    
    // Update statistics
    this.updateStatisticsCounts();
    
    return true;
  }

  async incrementDownloadCount(id: number): Promise<Dataset | undefined> {
    const dataset = this.datasetsStore.get(id);
    if (!dataset) return undefined;

    dataset.downloadCount = (dataset.downloadCount || 0) + 1;
    this.datasetsStore.set(id, dataset);
    return dataset;
  }

  // Organization methods
  async getOrganizations(
    limit: number = 100,
    offset: number = 0,
  ): Promise<Organization[]> {
    return Array.from(this.organizationsStore.values())
      .sort((a, b) => (b.datasetCount || 0) - (a.datasetCount || 0))
      .slice(offset, offset + limit);
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizationsStore.get(id);
  }

  async createOrganization(
    insertOrganization: InsertOrganization,
  ): Promise<Organization> {
    const id = this.organizationIdCounter++;
    const organization: Organization = {
      ...insertOrganization,
      id,
      datasetCount: 0,
    };
    this.organizationsStore.set(id, organization);

    // Update statistics
    this.updateStatisticsCounts();

    return organization;
  }

  // Crisis methods
  async getCrises(
    active: boolean = true,
    limit: number = 100,
    offset: number = 0,
  ): Promise<Crisis[]> {
    return Array.from(this.crisesStore.values())
      .filter((crisis) => (active ? crisis.isActive : true))
      .sort((a, b) => (b.datasetCount || 0) - (a.datasetCount || 0))
      .slice(offset, offset + limit);
  }

  async getCrisis(id: number): Promise<Crisis | undefined> {
    return this.crisesStore.get(id);
  }

  async createCrisis(insertCrisis: InsertCrisis): Promise<Crisis> {
    const id = this.crisisIdCounter++;
    const crisis: Crisis = {
      ...insertCrisis,
      id,
      datasetCount: 0,
    };
    this.crisesStore.set(id, crisis);

    // Update statistics
    this.updateStatisticsCounts();

    return crisis;
  }

  // Statistics methods
  async getStatistics(): Promise<Statistics | undefined> {
    return Array.from(this.statisticsStore.values())[0];
  }

  async updateStatistics(
    insertStatistics: InsertStatistics,
  ): Promise<Statistics> {
    const id = 1; // We'll always use ID 1 for global statistics
    const statistics: Statistics = {
      ...insertStatistics,
      id,
      lastUpdated: new Date(),
    };
    this.statisticsStore.set(id, statistics);
    return statistics;
  }

  // Visualization methods
  async getVisualizations(
    limit: number = 100,
    offset: number = 0,
  ): Promise<Visualization[]> {
    return Array.from(this.visualizationsStore.values())
      .sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      )
      .slice(offset, offset + limit);
  }

  async getVisualization(id: number): Promise<Visualization | undefined> {
    return this.visualizationsStore.get(id);
  }

  async createVisualization(
    insertVisualization: InsertVisualization,
  ): Promise<Visualization> {
    const id = this.visualizationIdCounter++;
    const visualization: Visualization = {
      ...insertVisualization,
      id,
      createdAt: new Date(),
    };
    this.visualizationsStore.set(id, visualization);
    return visualization;
  }

  // Helper method to update statistics
  private async updateStatisticsCounts(): Promise<void> {
    const datasetCount = this.datasetsStore.size;
    const organizationCount = this.organizationsStore.size;
    const locationSet = new Set(
      Array.from(this.datasetsStore.values())
        .map((dataset) => dataset.location)
        .filter(Boolean),
    );
    const locationCount = locationSet.size;
    const activeCrisisCount = Array.from(this.crisesStore.values()).filter(
      (crisis) => crisis.isActive,
    ).length;

    await this.updateStatistics({
      datasetCount,
      organizationCount,
      locationCount,
      activeCrisisCount,
    });
  }

  // Initialize with sample data for development
  private initSampleData(): void {
    // Create an admin user
    // Password hash for "admin1234"
    const adminPasswordHash = "80cd4914e8ece5fb0b17927288ecaa8a7529e3b96c11b15f13e3da03256c9926e8f9f7c8ae7ab3ae0fbe3a81dee7eafcc37faf98c4e0a5e75d14190236a9b5a7:939e27769e894bc7dfd53a5494adf208";
    
    this.usersStore.set(1, {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      password: adminPasswordHash,
      displayName: "Administrator",
      role: "admin",
      organization: "HDX Platform",
      isActive: true,
      createdAt: new Date()
    });
    this.userIdCounter = 2; // Start user IDs from 2
    
    // Add sample organizations
    const unhcr = this.createOrganizationSync({
      name: "UN Refugee Agency",
      acronym: "UNHCR",
      description:
        "Providing refugee data, displacement statistics, and humanitarian information for crisis response.",
      logoUrl: "",
    });

    const wfp = this.createOrganizationSync({
      name: "World Food Programme",
      acronym: "WFP",
      description:
        "Providing food security data, nutrition information, and market analysis for hunger relief efforts.",
      logoUrl: "",
    });

    const who = this.createOrganizationSync({
      name: "World Health Organization",
      acronym: "WHO",
      description:
        "Providing health data, disease surveillance, and healthcare system information for global health response.",
      logoUrl: "",
    });

    // Add sample crises
    const ukraineCrisis = this.createCrisisSync({
      name: "Ukraine Conflict",
      description:
        "Ongoing armed conflict in Ukraine resulting in displacement and humanitarian needs.",
      location: "Ukraine",
      tags: ["Conflict", "Displacement", "Europe"],
      isActive: true,
    });

    const hornOfAfricaDrought = this.createCrisisSync({
      name: "Horn of Africa Drought",
      description:
        "Severe drought affecting countries in the Horn of Africa region.",
      location: "Somalia",
      tags: ["Drought", "Food Security", "Africa"],
      isActive: true,
    });

    // Add sample datasets
    this.createDatasetSync({
      title: "Ukraine Conflict: IDP Figures by Oblast",
      description:
        "Internally displaced people (IDP) figures by oblast in Ukraine. Data updated weekly.",
      source: "UNHCR Ukraine Operations",
      organizationId: unhcr.id,
      location: "Ukraine",
      category: "Population & Migration",
      tags: ["Population", "Conflict", "Displacement"],
      format: "CSV",
      fileUrl: "/datasets/ukraine_idp_figures.csv",
    });

    this.createDatasetSync({
      title: "Somalia: Acute Food Insecurity Projections",
      description:
        "Integrated food security phase classification with seasonal projections for Somalia, 2023.",
      source: "FAO Somalia",
      organizationId: wfp.id,
      location: "Somalia",
      category: "Food Security",
      tags: ["Food Security", "Drought", "Agriculture"],
      format: "CSV",
      fileUrl: "/datasets/somalia_food_insecurity.csv",
    });

    this.createDatasetSync({
      title: "Global: COVID-19 Vaccination Rates",
      description:
        "Global COVID-19 vaccination coverage by country, including first, second, and booster doses.",
      source: "WHO COVID-19 Dashboard",
      organizationId: who.id,
      location: "Global",
      category: "Health & Nutrition",
      tags: ["Health", "COVID-19", "Vaccination"],
      format: "CSV",
      fileUrl: "/datasets/global_covid_vaccination.csv",
    });

    // Add sample visualizations
    this.createVisualizationSync({
      title: "Global Forced Displacement Trends",
      description:
        "This visualization shows global forced displacement trends over time, including refugees, asylum-seekers, internally displaced people, and other populations of concern.",
      source: "UNHCR Refugee Data Finder, Updated June 2023",
      datasetId: 1,
      visualizationType: "LineChart",
      config: {},
    });

    this.createVisualizationSync({
      title: "Food Insecurity Hotspots",
      description:
        "Global map showing areas with high levels of food insecurity.",
      source: "WFP HungerMap, Updated June 2023",
      datasetId: 2,
      visualizationType: "MapChart",
      config: {},
    });

    this.createVisualizationSync({
      title: "Health Facility Access in Crisis Areas",
      description:
        "Comparative chart showing access to health facilities across crisis regions.",
      source:
        "WHO Health Resources Availability Monitoring System, Updated May 2023",
      datasetId: 3,
      visualizationType: "BarChart",
      config: {},
    });

    // Update statistics
    this.updateStatisticsCounts();
  }

  // Synchronous versions of methods for initialization
  private createOrganizationSync(
    insertOrganization: InsertOrganization,
  ): Organization {
    const id = this.organizationIdCounter++;
    const organization: Organization = {
      ...insertOrganization,
      id,
      datasetCount: 0,
    };
    this.organizationsStore.set(id, organization);
    return organization;
  }

  private createCrisisSync(insertCrisis: InsertCrisis): Crisis {
    const id = this.crisisIdCounter++;
    const crisis: Crisis = {
      ...insertCrisis,
      id,
      datasetCount: 0,
    };
    this.crisesStore.set(id, crisis);
    return crisis;
  }

  private createDatasetSync(insertDataset: InsertDataset): Dataset {
    const id = this.datasetIdCounter++;
    const dataset: Dataset = {
      ...insertDataset,
      id,
      downloadCount: Math.floor(Math.random() * 10000),
      lastUpdated: new Date(),
    };
    this.datasetsStore.set(id, dataset);

    // Update organization dataset count
    const organization = this.organizationsStore.get(dataset.organizationId);
    if (organization) {
      organization.datasetCount = (organization.datasetCount || 0) + 1;
      this.organizationsStore.set(organization.id, organization);
    }

    return dataset;
  }

  private createVisualizationSync(
    insertVisualization: InsertVisualization,
  ): Visualization {
    const id = this.visualizationIdCounter++;
    const visualization: Visualization = {
      ...insertVisualization,
      id,
      createdAt: new Date(),
    };
    this.visualizationsStore.set(id, visualization);
    return visualization;
  }
}

export const storage = new MemStorage();
