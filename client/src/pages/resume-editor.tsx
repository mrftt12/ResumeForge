import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Resume, resumeSchema } from "@shared/schema";
import { Loader2, Eye, FileDown, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { exportToPdf, exportToWord, exportToText, downloadFile } from "@/lib/pdf-generator";

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function ResumeEditor() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCustomSectionOpen, setIsCustomSectionOpen] = useState(false);
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');

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

  // Handle preview functionality
  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // Handle export functionality
  const handleExport = async () => {
    if (!resumeData) return;

    try {
      setIsExporting(true);
      let blob: Blob;
      let filename = `${resumeData.title.replace(/\s+/g, '_')}_resume`;

      switch (exportFormat) {
        case 'pdf':
          blob = await exportToPdf(resumeData);
          filename += '.pdf';
          break;
        case 'docx':
          blob = await exportToWord(resumeData);
          filename += '.docx';
          break;
        case 'txt':
          blob = await exportToText(resumeData);
          filename += '.txt';
          break;
        default:
          blob = await exportToPdf(resumeData);
          filename += '.pdf';
      }

      downloadFile(blob, filename);
      
      toast({
        title: "Resume Exported",
        description: `Your resume has been exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
                <Button variant="outline" onClick={handlePreview}>
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
                  <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                      </>
                    )}
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Resume Preview
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPreviewOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              This is how your resume will look when exported
            </DialogDescription>
          </DialogHeader>
          
          {/* Preview Content */}
          <div className="bg-white p-8 border rounded-md shadow-sm">
            {/* Header with name and contact */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 text-gray-600 text-sm">
                {resumeData.personalInfo.email && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {resumeData.personalInfo.email}
                  </span>
                )}
                {resumeData.personalInfo.phone && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {resumeData.personalInfo.phone}
                  </span>
                )}
                {resumeData.personalInfo.location && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {resumeData.personalInfo.location}
                  </span>
                )}
                {resumeData.personalInfo.website && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    {resumeData.personalInfo.website}
                  </span>
                )}
                {resumeData.personalInfo.linkedin && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    {resumeData.personalInfo.linkedin}
                  </span>
                )}
              </div>
            </div>

            {/* Display sections based on their order */}
            {resumeData.sections
              .filter(section => section.visible)
              .sort((a, b) => a.order - b.order)
              .map(section => {
                switch (section.type) {
                  case 'summary':
                    return (
                      <div key={section.id} className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">Professional Summary</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{resumeData.professionalSummary}</p>
                      </div>
                    );
                  case 'experience':
                    return (
                      <div key={section.id} className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">Work Experience</h2>
                        {resumeData.workExperience.map(exp => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-gray-900">{exp.jobTitle}</h3>
                              <span className="text-sm text-gray-600">
                                {exp.startDate} - {exp.currentPosition ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-gray-700">{exp.employer}</h4>
                              {exp.location && <span className="text-sm text-gray-600">{exp.location}</span>}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    );
                  case 'education':
                    return (
                      <div key={section.id} className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">Education</h2>
                        {resumeData.education.map(edu => (
                          <div key={edu.id} className="mb-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                              <span className="text-sm text-gray-600">
                                {edu.startDate ? `${edu.startDate} - ` : ''}{edu.currentlyStudying ? 'Present' : edu.endDate}
                              </span>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-gray-700">{edu.institution}</h4>
                              {edu.location && <span className="text-sm text-gray-600">{edu.location}</span>}
                            </div>
                            {edu.description && <p className="text-gray-700 whitespace-pre-wrap">{edu.description}</p>}
                          </div>
                        ))}
                      </div>
                    );
                  case 'skills':
                    return (
                      <div key={section.id} className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">Skills</h2>
                        
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Technical Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.technical.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
                          <div>
                            <h3 className="font-medium text-gray-900 mb-2">Soft Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {resumeData.skills.soft.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  case 'custom':
                    return (
                      <div key={section.id} className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-3">{section.title}</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                      </div>
                    );
                  default:
                    return null;
                }
              })
            }
          </div>
          
          <DialogFooter className="flex items-center justify-between mt-4">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setExportFormat('pdf');
                  handleExport();
                }}
                disabled={isExporting}
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
                Export as PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setExportFormat('docx');
                  handleExport();
                }}
                disabled={isExporting}
              >
                Export as DOCX
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setExportFormat('txt');
                  handleExport();
                }}
                disabled={isExporting}
              >
                Export as TXT
              </Button>
            </div>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
