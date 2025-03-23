import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Skills {
  technical: string[];
  soft?: string[];
}

interface SkillsSectionProps {
  skills: Skills;
  onChange: (skills: Skills) => void;
}

export default function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const [technicalSkillInput, setTechnicalSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");

  const handleAddTechnicalSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && technicalSkillInput.trim()) {
      e.preventDefault();
      const newSkills = {
        ...skills,
        technical: [...skills.technical, technicalSkillInput.trim()],
      };
      onChange(newSkills);
      setTechnicalSkillInput("");
    }
  };

  const handleAddSoftSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && softSkillInput.trim()) {
      e.preventDefault();
      const newSkills = {
        ...skills,
        soft: [...(skills.soft || []), softSkillInput.trim()],
      };
      onChange(newSkills);
      setSoftSkillInput("");
    }
  };

  const handleRemoveTechnicalSkill = (index: number) => {
    const newTechnicalSkills = [...skills.technical];
    newTechnicalSkills.splice(index, 1);
    onChange({
      ...skills,
      technical: newTechnicalSkills,
    });
  };

  const handleRemoveSoftSkill = (index: number) => {
    const newSoftSkills = [...(skills.soft || [])];
    newSoftSkills.splice(index, 1);
    onChange({
      ...skills,
      soft: newSoftSkills,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
        Skills
      </h2>
      
      <div className="mb-4">
        <Label htmlFor="technical-skills">
          Technical Skills <span className="text-red-500">*</span>
        </Label>
        <div className="mt-1">
          <div className="flex flex-wrap gap-2 border border-gray-300 rounded-md p-2 min-h-[100px]">
            {skills.technical.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  className="ml-1 inline-flex text-blue-500 hover:text-blue-600"
                  onClick={() => handleRemoveTechnicalSkill(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            ))}
            <Input
              type="text"
              className="inline-flex h-9 w-28 rounded-md border-0 py-1.5 text-sm"
              placeholder="Add skill..."
              value={technicalSkillInput}
              onChange={(e) => setTechnicalSkillInput(e.target.value)}
              onKeyDown={handleAddTechnicalSkill}
            />
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Press Enter after typing each skill to add it to the list.</p>
      </div>
      
      <div>
        <Label htmlFor="soft-skills">Soft Skills</Label>
        <div className="mt-1">
          <div className="flex flex-wrap gap-2 border border-gray-300 rounded-md p-2 min-h-[100px]">
            {(skills.soft || []).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {skill}
                <button
                  type="button"
                  className="ml-1 inline-flex text-green-500 hover:text-green-600"
                  onClick={() => handleRemoveSoftSkill(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            ))}
            <Input
              type="text"
              className="inline-flex h-9 w-28 rounded-md border-0 py-1.5 text-sm"
              placeholder="Add skill..."
              value={softSkillInput}
              onChange={(e) => setSoftSkillInput(e.target.value)}
              onKeyDown={handleAddSoftSkill}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
