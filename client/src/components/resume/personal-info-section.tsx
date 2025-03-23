import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
  onChange: (personalInfo: PersonalInfo) => void;
}

export default function PersonalInfoSection({ personalInfo, onChange }: PersonalInfoSectionProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...personalInfo,
      [field]: value,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="first-name">
            First name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            id="first-name"
            value={personalInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="last-name">
            Last name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            id="last-name"
            value={personalInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">
            Email address <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            id="email"
            value={personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone-number">Phone number</Label>
          <Input
            type="tel"
            id="phone-number"
            value={personalInfo.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            value={personalInfo.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="website">Website/Portfolio</Label>
          <Input
            type="url"
            id="website"
            value={personalInfo.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              linkedin.com/in/
            </span>
            <Input
              type="text"
              id="linkedin"
              className="rounded-l-none"
              value={personalInfo.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
