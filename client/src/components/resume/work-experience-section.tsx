import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

interface WorkExperience {
  id: string;
  jobTitle: string;
  employer: string;
  startDate: string;
  endDate?: string;
  currentPosition?: boolean;
  location?: string;
  description: string;
}

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export default function WorkExperienceSection({ experiences, onChange }: WorkExperienceSectionProps) {
  const handleChange = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    
    // Handle current position checkbox special case
    if (field === 'currentPosition' && value === true) {
      updatedExperiences[index].endDate = '';
    }
    
    onChange(updatedExperiences);
  };

  const handleAddExperience = () => {
    const newExperience: WorkExperience = {
      id: uuidv4(),
      jobTitle: "",
      employer: "",
      startDate: "",
      endDate: "",
      currentPosition: false,
      location: "",
      description: "",
    };
    
    onChange([...experiences, newExperience]);
  };

  const handleRemoveExperience = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    onChange(updatedExperiences);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        Work Experience
      </h2>
      
      {experiences.map((experience, index) => (
        <div key={experience.id} className="border border-gray-200 rounded-md p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div className="mb-2 sm:mb-0 sm:w-1/2 sm:pr-2">
              <Label htmlFor={`job-title-${index}`}>
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id={`job-title-${index}`}
                className="mt-1"
                value={experience.jobTitle}
                onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
              />
            </div>
            <div className="sm:w-1/2 sm:pl-2">
              <Label htmlFor={`employer-${index}`}>
                Employer <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id={`employer-${index}`}
                className="mt-1"
                value={experience.employer}
                onChange={(e) => handleChange(index, 'employer', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div className="mb-2 sm:mb-0 sm:w-1/2 sm:pr-2">
              <Label htmlFor={`start-date-${index}`}>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="month"
                id={`start-date-${index}`}
                className="mt-1"
                value={experience.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="sm:w-1/2 sm:pl-2">
              <Label htmlFor={`end-date-${index}`}>
                End Date {!experience.currentPosition && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="month"
                id={`end-date-${index}`}
                className="mt-1"
                value={experience.endDate || ''}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                disabled={experience.currentPosition}
              />
              <div className="mt-2">
                <div className="flex items-center">
                  <Checkbox
                    id={`current-position-${index}`}
                    checked={experience.currentPosition || false}
                    onCheckedChange={(checked) => handleChange(index, 'currentPosition', !!checked)}
                  />
                  <Label htmlFor={`current-position-${index}`} className="ml-2 text-sm text-gray-700">
                    I currently work here
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor={`job-location-${index}`}>Location</Label>
            <Input
              type="text"
              id={`job-location-${index}`}
              className="mt-1"
              value={experience.location || ''}
              onChange={(e) => handleChange(index, 'location', e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor={`job-description-${index}`}>
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id={`job-description-${index}`}
              rows={4}
              className="mt-1"
              value={experience.description}
              onChange={(e) => handleChange(index, 'description', e.target.value)}
              placeholder="• Led a team of 5 developers in redesigning the company's product
• Implemented new component library that reduced code duplication by 40%
• Collaborated with UX team to improve user flows and accessibility"
            />
            <p className="mt-1 text-sm text-gray-500">Use bullet points to highlight achievements and responsibilities.</p>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={() => handleRemoveExperience(index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </Button>
          </div>
        </div>
      ))}
      
      <Button
        variant="outline"
        onClick={handleAddExperience}
        className="mt-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Work Experience
      </Button>
    </div>
  );
}
