import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate?: string;
  endDate: string;
  currentlyStudying?: boolean;
  location?: string;
  description?: string;
}

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function EducationSection({ education, onChange }: EducationSectionProps) {
  const handleChange = (index: number, field: keyof Education, value: string | boolean) => {
    const updatedEducation = [...education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };
    
    // Handle currently studying checkbox special case
    if (field === 'currentlyStudying' && value === true) {
      updatedEducation[index].endDate = '';
    }
    
    onChange(updatedEducation);
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: uuidv4(),
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      currentlyStudying: false,
      location: "",
      description: "",
    };
    
    onChange([...education, newEducation]);
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    onChange(updatedEducation);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
        Education
      </h2>
      
      {education.map((edu, index) => (
        <div key={edu.id} className="border border-gray-200 rounded-md p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div className="mb-2 sm:mb-0 sm:w-1/2 sm:pr-2">
              <Label htmlFor={`degree-${index}`}>
                Degree <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id={`degree-${index}`}
                className="mt-1"
                value={edu.degree}
                onChange={(e) => handleChange(index, 'degree', e.target.value)}
              />
            </div>
            <div className="sm:w-1/2 sm:pl-2">
              <Label htmlFor={`institution-${index}`}>
                Institution <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id={`institution-${index}`}
                className="mt-1"
                value={edu.institution}
                onChange={(e) => handleChange(index, 'institution', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div className="mb-2 sm:mb-0 sm:w-1/2 sm:pr-2">
              <Label htmlFor={`edu-start-date-${index}`}>Start Date</Label>
              <Input
                type="month"
                id={`edu-start-date-${index}`}
                className="mt-1"
                value={edu.startDate || ''}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="sm:w-1/2 sm:pl-2">
              <Label htmlFor={`edu-end-date-${index}`}>
                End Date {!edu.currentlyStudying && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="month"
                id={`edu-end-date-${index}`}
                className="mt-1"
                value={edu.endDate || ''}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                disabled={edu.currentlyStudying}
              />
              <div className="mt-2">
                <div className="flex items-center">
                  <Checkbox
                    id={`current-education-${index}`}
                    checked={edu.currentlyStudying || false}
                    onCheckedChange={(checked) => handleChange(index, 'currentlyStudying', !!checked)}
                  />
                  <Label htmlFor={`current-education-${index}`} className="ml-2 text-sm text-gray-700">
                    I'm currently studying here
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor={`edu-location-${index}`}>Location</Label>
            <Input
              type="text"
              id={`edu-location-${index}`}
              className="mt-1"
              value={edu.location || ''}
              onChange={(e) => handleChange(index, 'location', e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor={`edu-description-${index}`}>Description</Label>
            <Textarea
              id={`edu-description-${index}`}
              rows={3}
              className="mt-1"
              value={edu.description || ''}
              onChange={(e) => handleChange(index, 'description', e.target.value)}
              placeholder="• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Web Development
• Senior project: Developed a collaborative code editor"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={() => handleRemoveEducation(index)}
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
        onClick={handleAddEducation}
        className="mt-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Education
      </Button>
    </div>
  );
}
