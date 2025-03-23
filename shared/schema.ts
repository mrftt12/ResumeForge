import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Resume schema
export const resumeSchema = z.object({
  id: z.string(),
  userId: z.number(),
  title: z.string(),
  jobUrl: z.string().optional(),
  personalInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  professionalSummary: z.string(),
  workExperience: z.array(z.object({
    id: z.string(),
    jobTitle: z.string(),
    employer: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    currentPosition: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string(),
  })),
  education: z.array(z.object({
    id: z.string(),
    degree: z.string(),
    institution: z.string(),
    startDate: z.string().optional(),
    endDate: z.string(),
    currentlyStudying: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()).optional(),
  }),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    content: z.any(),
    visible: z.boolean().default(true),
    order: z.number(),
  })),
  customSections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    visible: z.boolean().default(true),
    order: z.number(),
  })).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Resume = z.infer<typeof resumeSchema>;

export const insertResumeSchema = resumeSchema.omit({ 
  id: true, 
  userId: true,
  createdAt: true,
  updatedAt: true
});

export type InsertResume = z.infer<typeof insertResumeSchema>;

export const resumes = pgTable("resumes", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  jobUrl: text("job_url"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDbResumeSchema = createInsertSchema(resumes);
export type InsertDbResume = z.infer<typeof insertDbResumeSchema>;
export type DbResume = typeof resumes.$inferSelect;
