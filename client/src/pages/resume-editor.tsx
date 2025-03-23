import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Resume, resumeSchema } from "@shared/schema";
import { Loader2, Eye } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PersonalInfoSection from "@/components/resume/personal-info-section";
import ProfessionalSummarySection from "@/components/resume/professional-summary-section";
import WorkExperienceSection from "@/components/resume/work-experience-section";
import EducationSection from "@/components/resume/education-section";
import SkillsSection from "@/components/resume/skills-section";
import SectionReorder from "@/components/resume/section-reorder";
import ExportOptions from "@/components/resume/export-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DialogCustomSection from "@/components/ui/dialog-custom-section";

export default function ResumeEditor() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCustomSectionOpen, setIsCustomSectionOpen] = useState(false);
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Determine if we're editing an existing resume or creating a new one
  const isNewResume = !params.id || params.id === "new";
  
  // Fetch resume data if editing an existing resume
  const { data: fetchedResume, isLoading: isFetchingResume } = useQuery<Resume>({
    queryKey: [`/api/resumes/${params.id}`],
    enabled: !isNewResume,
  });

  // Initialize with default resume data for new resume
  useEffect(() => {
    if (isNewResume) {
      const newResume: Resume = {
        id: "",
        userId: 0,
        title: "Untitled Resume",
        jobUrl: "",
        personalInfo: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          location: "",
          website: "",
          linkedin: "",
        },
        professionalSummary: "",
        workExperience: [],
        education: [],
        skills: {
          technical: [],
          soft: [],
        },
        sections: [
          { id: uuidv4(), title: "Professional Summary", type: "summary", content: null, visible: true, order: 0 },
          { id: uuidv4(), title: "Work Experience", type: "experience", content: null, visible: true, order: 1 },
          { id: uuidv4(), title: "Education", type: "education", content: null, visible: true, order: 2 },
          { id: uuidv4(), title: "Skills", type: "skills", content: null, visible: true, order: 3 },
        ],
        customSections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setResumeData(newResume);
    } else if (fetchedResume) {
      setResumeData(fetchedResume);
    }
  }, [isNewResume, fetchedResume]);

  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async (resume: Omit<Resume, "id" | "userId" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/resumes", resume);
      return await res.json();
    },
    onSuccess: (newResume: Resume) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume Created",
        description: "Your resume has been created successfully.",
      });
      navigate(`/resume/${newResume.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async (resume: Partial<Resume>) => {
      const res = await apiRequest("PUT", `/api/resumes/${resume.id}`, resume);
      return await res.json();
    },
    onSuccess: (updatedResume: Resume) => {
      queryClient.invalidateQueries({ queryKey: [`/api/resumes/${updatedResume.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume Updated",
        description: "Your resume has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate completion percentage
  useEffect(() => {
    if (!resumeData) return;
    
    let filledFields = 0;
    let totalRequiredFields = 0;
    
    // Personal Info
    const personalInfoRequired = ["firstName", "lastName", "email"];
    personalInfoRequired.forEach(field => {
      totalRequiredFields++;
      if (resumeData.personalInfo[field as keyof typeof resumeData.personalInfo]) filledFields++;
    });
    
    // Professional Summary
    totalRequiredFields++;
    if (resumeData.professionalSummary) filledFields++;
    
    // Work Experience - at least one entry with required fields
    if (resumeData.workExperience.length > 0) {
      const workExpRequired = ["jobTitle", "employer", "startDate", "description"];
      workExpRequired.forEach(field => {
        totalRequiredFields++;
        if (resumeData.workExperience[0][field as keyof typeof resumeData.workExperience[0]]) filledFields++;
      });
    }
    
    // Education - at least one entry with required fields
    if (resumeData.education.length > 0) {
      const eduRequired = ["degree", "institution", "endDate"];
      eduRequired.forEach(field => {
        totalRequiredFields++;
        if (resumeData.education[0][field as keyof typeof resumeData.education[0]]) filledFields++;
      });
    }
    
    // Skills - at least one technical skill
    totalRequiredFields++;
    if (resumeData.skills.technical.length > 0) filledFields++;
    
    const percentage = Math.min(Math.round((filledFields / totalRequiredFields) * 100), 100);
    setCompletionPercentage(percentage);
  }, [resumeData]);

  // Handle save
  const handleSave = () => {
    if (!resumeData) return;
    
    try {
      // Validate the data
      resumeSchema.parse(resumeData);
      
      if (isNewResume) {
        // Pick only fields needed for creation
        const { id, userId, createdAt, updatedAt, ...createData } = resumeData;
        createResumeMutation.mutate(createData);
      } else {
        updateResumeMutation.mutate(resumeData);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a custom section
  const handleAddCustomSection = (title: string) => {
    if (!resumeData) return;
    
    const newSection = {
      id: uuidv4(),
      title,
      type: "custom",
      content: "",
      visible: true,
      order: resumeData.sections.length,
    };
    
    setResumeData({
      ...resumeData,
      sections: [...resumeData.sections, newSection],
    });
    
    setIsCustomSectionOpen(false);
  };

  // Handle resume updates
  const updateResumeField = (path: string[], value: any) => {
    if (!resumeData) return;
    
    let newResumeData = { ...resumeData };
    let current = newResumeData;
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      current = current[key as keyof typeof current] as any;
    }
    
    const lastKey = path[path.length - 1];
    current[lastKey as keyof typeof current] = value;
    
    setResumeData(newResumeData);
  };

  if (isFetchingResume || !resumeData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <input 
                  type="text" 
                  value={resumeData.title} 
                  onChange={(e) => updateResumeField(["title"], e.target.value)}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                />
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={createResumeMutation.isPending || updateResumeMutation.isPending}
                >
                  {createResumeMutation.isPending || updateResumeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <div className="relative">
                  <Button variant="outline">
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="w-full my-4">
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{completionPercentage}% Complete</p>
          </div>

          {/* Resume Job Link */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="mb-4">
              <Label htmlFor="job-url">Job Posting URL</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </span>
                <Input
                  type="text"
                  id="job-url"
                  className="rounded-l-none"
                  placeholder="https://example.com/job-posting"
                  value={resumeData.jobUrl || ""}
                  onChange={(e) => updateResumeField(["jobUrl"], e.target.value)}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Link this resume to a specific job posting for targeted content.</p>
            </div>
          </div>

          {/* Section reordering */}
          <SectionReorder 
            sections={resumeData.sections} 
            onSectionsChange={(sections) => updateResumeField(["sections"], sections)}
            onAddCustomSection={() => setIsCustomSectionOpen(true)} 
          />

          {/* Personal Info Section */}
          {resumeData.sections.find(s => s.type === "summary" && s.visible) && (
            <PersonalInfoSection 
              personalInfo={resumeData.personalInfo}
              onChange={(personalInfo) => updateResumeField(["personalInfo"], personalInfo)} 
            />
          )}

          {/* Professional Summary Section */}
          {resumeData.sections.find(s => s.type === "summary" && s.visible) && (
            <ProfessionalSummarySection 
              summary={resumeData.professionalSummary}
              onChange={(summary) => updateResumeField(["professionalSummary"], summary)}
            />
          )}

          {/* Work Experience Section */}
          {resumeData.sections.find(s => s.type === "experience" && s.visible) && (
            <WorkExperienceSection 
              experiences={resumeData.workExperience}
              onChange={(experiences) => updateResumeField(["workExperience"], experiences)}
            />
          )}

          {/* Education Section */}
          {resumeData.sections.find(s => s.type === "education" && s.visible) && (
            <EducationSection 
              education={resumeData.education}
              onChange={(education) => updateResumeField(["education"], education)}
            />
          )}

          {/* Skills Section */}
          {resumeData.sections.find(s => s.type === "skills" && s.visible) && (
            <SkillsSection 
              skills={resumeData.skills}
              onChange={(skills) => updateResumeField(["skills"], skills)}
            />
          )}

          {/* Custom Sections */}
          {resumeData.sections
            .filter(section => section.type === "custom" && section.visible)
            .map(section => (
              <div key={section.id} className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  {section.title}
                </h2>
                <div>
                  <textarea
                    rows={6}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    value={section.content || ""}
                    onChange={(e) => {
                      const updatedSections = resumeData.sections.map(s => 
                        s.id === section.id ? { ...s, content: e.target.value } : s
                      );
                      updateResumeField(["sections"], updatedSections);
                    }}
                  />
                </div>
              </div>
            ))}

          {/* Export Options */}
          <ExportOptions />

          {/* Bottom Save Button */}
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSave}
              disabled={createResumeMutation.isPending || updateResumeMutation.isPending}
            >
              {createResumeMutation.isPending || updateResumeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Resume...
                </>
              ) : (
                "Save Resume"
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Fixed Add Section Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full"
          onClick={() => setIsCustomSectionOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>
      </div>

      {/* Custom Section Dialog */}
      <DialogCustomSection 
        open={isCustomSectionOpen}
        onOpenChange={setIsCustomSectionOpen}
        onAdd={handleAddCustomSection}
      />
    </div>
  );
}
