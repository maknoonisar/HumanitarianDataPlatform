import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertDatasetSchema, 
  insertOrganizationSchema, 
  insertCrisisSchema, 
  insertVisualizationSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  requireAuth, 
  requireRole 
} from "./auth";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "datasets");
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage_config });

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  function handleError(err: any, res: Response) {
    console.error('Error details:', err);
    
    if (err instanceof ZodError) {
      console.log('Validation error details:', JSON.stringify(err.errors));
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
        details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    
    return res.status(500).json({ 
      message: err.message || "Internal server error",
      error: err.toString()
    });
  }

  // API endpoints
  app.get("/api/statistics", async (req: Request, res: Response) => {
    try {
      const statistics = await storage.getStatistics();
      res.json(statistics);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Dataset routes
  app.get("/api/datasets", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const datasets = await storage.getDatasets(limit, offset);
      res.json(datasets);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/datasets/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const datasets = await storage.searchDatasets(query);
      res.json(datasets);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/datasets/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const datasets = await storage.getDatasetsByCategory(category);
      res.json(datasets);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/datasets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const dataset = await storage.getDataset(id);
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      res.json(dataset);
    } catch (err) {
      handleError(err, res);
    }
  });

  // These endpoints are secured below with requireAuth and requireRole

  app.post("/api/datasets/:id/download", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const dataset = await storage.incrementDownloadCount(id);
      
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      // If there's a file URL, send the file for download
      if (dataset.fileUrl) {
        // Check if it's a local file path
        if (dataset.fileUrl.startsWith('/uploads')) {
          // Construct the full file path
          const filePath = path.join(process.cwd(), dataset.fileUrl);
          
          // Check if file exists
          if (fs.existsSync(filePath)) {
            // Get filename from path
            const fileName = path.basename(filePath);
            
            // Set headers for file download
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            
            // Set content type based on file extension
            const ext = path.extname(fileName).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.csv') contentType = 'text/csv';
            if (ext === '.pdf') contentType = 'application/pdf';
            if (ext === '.json') contentType = 'application/json';
            if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            res.setHeader('Content-Type', contentType);
            
            // Stream the file to the response
            return fs.createReadStream(filePath).pipe(res);
          }
        } 
        // For external URLs, redirect to the file
        else if (dataset.fileUrl.startsWith('http')) {
          return res.redirect(dataset.fileUrl);
        }
      }
      
      // If no valid file URL or file doesn't exist, return success with download count
      res.json({ 
        success: true, 
        downloadCount: dataset.downloadCount,
        message: "This is a simulated download. No file is associated with this dataset."
      });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Organization routes
  app.get("/api/organizations", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const organizations = await storage.getOrganizations(limit, offset);
      res.json(organizations);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/organizations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const organization = await storage.getOrganization(id);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/organizations/:id/datasets", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const datasets = await storage.getDatasetsByOrganization(id);
      res.json(datasets);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/organizations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(validatedData);
      res.status(201).json(organization);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Crisis routes
  app.get("/api/crises", async (req: Request, res: Response) => {
    try {
      const active = req.query.active !== "false";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const crises = await storage.getCrises(active, limit, offset);
      res.json(crises);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/crises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const crisis = await storage.getCrisis(id);
      if (!crisis) {
        return res.status(404).json({ message: "Crisis not found" });
      }
      res.json(crisis);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/crises/:id/datasets", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const datasets = await storage.getDatasetsByCrisis(id);
      res.json(datasets);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/crises", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCrisisSchema.parse(req.body);
      const crisis = await storage.createCrisis(validatedData);
      res.status(201).json(crisis);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Visualization routes
  app.get("/api/visualizations", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const visualizations = await storage.getVisualizations(limit, offset);
      res.json(visualizations);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/visualizations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const visualization = await storage.getVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      res.json(visualization);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/visualizations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertVisualizationSchema.parse(req.body);
      const visualization = await storage.createVisualization(validatedData);
      res.status(201).json(visualization);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Direct file download endpoint
  app.get("/api/download/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      // Sanitize filename to prevent directory traversal attacks
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(process.cwd(), 'uploads', 'datasets', sanitizedFilename);
      
      console.log("Attempting to download file:", filePath);
      
      if (!fs.existsSync(filePath)) {
        console.log("File not found:", filePath);
        return res.status(404).send("File not found");
      }
      
      // Set headers for file download with quoted filename for better browser compatibility
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
      
      // Set content type based on file extension
      const ext = path.extname(sanitizedFilename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.csv') contentType = 'text/csv';
      if (ext === '.pdf') contentType = 'application/pdf';
      if (ext === '.json') contentType = 'application/json';
      if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (ext === '.zip') contentType = 'application/zip';
      if (ext === '.shp') contentType = 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Use download method for better browser compatibility
      res.download(filePath, sanitizedFilename, (err) => {
        if (err) {
          console.error("Error during file download:", err);
          // Only send error if headers haven't been sent yet
          if (!res.headersSent) {
            res.status(500).send("Error downloading file");
          }
        }
      });
    } catch (err) {
      console.error("Error during file download:", err);
      res.status(500).send("Error downloading file");
    }
  });

  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      // Remove password before sending response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Authentication endpoints
  app.post("/api/register", registerUser);
  app.post("/api/login", loginUser);
  app.post("/api/logout", logoutUser);
  app.get("/api/user", getCurrentUser);

  // Secure endpoints with authentication and role-based access control
  // Only admins and uploaders can create datasets
  app.post("/api/datasets", requireAuth, requireRole(["admin", "uploader"]), async (req: Request, res: Response) => {
    try {
      const validatedData = insertDatasetSchema.parse(req.body);
      const dataset = await storage.createDataset(validatedData);
      res.status(201).json(dataset);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Only admins and uploaders can upload dataset files
  app.post("/api/datasets/upload", requireAuth, requireRole(["admin", "uploader"]), upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Create relative file path to store in the database
      const relativeFilePath = `/uploads/datasets/${req.file.filename}`;
      
      // Parse dataset data
      console.log("Raw dataset info:", req.body.datasetInfo);
      let datasetData;
      try {
        datasetData = JSON.parse(req.body.datasetInfo);
        console.log("Parsed dataset data:", datasetData);
        
        // Ensure organizationId is a number
        if (typeof datasetData.organizationId === 'string') {
          datasetData.organizationId = parseInt(datasetData.organizationId, 10);
        }
        
        // Ensure crisisId is a number if present
        if (datasetData.crisisId && typeof datasetData.crisisId === 'string') {
          datasetData.crisisId = parseInt(datasetData.crisisId, 10);
        }
        
        // Ensure tags is an array
        if (typeof datasetData.tags === 'string') {
          datasetData.tags = datasetData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
        }
        
        console.log("Processed dataset data:", datasetData);
      } catch (parseError: any) {
        console.error("Error parsing dataset info:", parseError);
        return res.status(400).json({ 
          message: "Invalid dataset info format",
          error: parseError.message || "JSON parse error" 
        });
      }
      
      // Validate the dataset data against the schema
      const validatedData = insertDatasetSchema.parse({
        ...datasetData,
        fileUrl: relativeFilePath,
        lastUpdated: new Date()
      });
      
      // Create dataset with file info
      const dataset = await storage.createDataset(validatedData);
      
      res.status(201).json({ 
        success: true, 
        message: "Dataset created successfully with file upload", 
        dataset 
      });
    } catch (err) {
      console.error("Error uploading dataset:", err);
      // Delete the uploaded file if dataset creation fails
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Failed to delete uploaded file:", unlinkErr);
        });
      }
      handleError(err, res);
    }
  });

  // Delete dataset endpoint (protected for admin users only)
  app.delete("/api/datasets/:id", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if dataset exists
      const dataset = await storage.getDataset(id);
      if (!dataset) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      // Check if there's a physical file to delete
      if (dataset.fileUrl) {
        const filePath = path.join(process.cwd(), dataset.fileUrl.replace(/^\/+/, ''));
        
        // If the file exists, delete it
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Delete the dataset from storage
      const success = await storage.deleteDataset(id);
      
      if (success) {
        res.status(200).json({ message: "Dataset deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete dataset" });
      }
    } catch (err) {
      handleError(err, res);
    }
  });

  const httpServer = createServer(app);
  // Admin role update endpoint (temporary)
  app.post("/api/update-role", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      await storage.updateUserRole(userId, "admin");
      res.status(200).json({ message: "Role updated to admin" });
    } catch (err) {
      handleError(err, res);
    }
  });

  return httpServer;
}

