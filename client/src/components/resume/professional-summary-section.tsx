import { Textarea } from "@/components/ui/textarea";

interface ProfessionalSummarySectionProps {
  summary: string;
  onChange: (summary: string) => void;
}

export default function ProfessionalSummarySection({ summary, onChange }: ProfessionalSummarySectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Professional Summary
        <span className="text-red-500 ml-1">*</span>
      </h2>
      
      <div>
        <Textarea
          id="professional-summary"
          placeholder="Brief overview of your professional background, key skills, and career goals. Limit to 3-5 sentences."
          rows={5}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="mt-2 text-sm text-gray-500">Brief overview of your professional background, key skills, and career goals. Limit to 3-5 sentences.</p>
      </div>
    </div>
  );
}
