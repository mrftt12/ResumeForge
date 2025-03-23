import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { resumeSchema, insertResumeSchema } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Helper to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Resume routes
  app.get("/api/resumes", ensureAuthenticated, async (req, res) => {
    try {
      const resumes = await storage.getResumes(req.user!.id);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resumes" });
    }
  });

  app.get("/api/resumes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const resume = await storage.getResume(req.params.id);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if resume belongs to the authenticated user
      if (resume.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resume" });
    }
  });

  app.post("/api/resumes", ensureAuthenticated, async (req, res) => {
    try {
      // Validate resume data with Zod schema
      const validatedData = insertResumeSchema.parse(req.body);
      
      // Create resume with validated data
      const resume = await storage.createResume(req.user!.id, validatedData);
      res.status(201).json(resume);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.put("/api/resumes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const resumeId = req.params.id;
      const existingResume = await storage.getResume(resumeId);
      
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if resume belongs to the authenticated user
      if (existingResume.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update only allowed fields
      const updatedResume = await storage.updateResume(resumeId, req.body);
      res.json(updatedResume);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete("/api/resumes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const resumeId = req.params.id;
      const existingResume = await storage.getResume(resumeId);
      
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if resume belongs to the authenticated user
      if (existingResume.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteResume(resumeId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete resume" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // Custom section routes
  app.post("/api/resumes/:id/sections", ensureAuthenticated, async (req, res) => {
    try {
      const resumeId = req.params.id;
      const existingResume = await storage.getResume(resumeId);
      
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if resume belongs to the authenticated user
      if (existingResume.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Section title is required" });
      }
      
      // Create a new custom section
      const newSection = {
        id: uuidv4(),
        title,
        type: "custom",
        content: "",
        visible: true,
        order: existingResume.sections.length,
      };
      
      const updatedSections = [...existingResume.sections, newSection];
      
      // Update resume with new section
      const updatedResume = await storage.updateResume(resumeId, {
        sections: updatedSections,
      });
      
      res.status(201).json(updatedResume);
    } catch (error) {
      res.status(500).json({ message: "Failed to add custom section" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
