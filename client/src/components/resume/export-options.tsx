import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { exportToPdf, exportToWord, exportToText } from "@/lib/pdf-generator";
import { saveToGoogleDrive, saveToDropbox } from "@/lib/cloud-storage";
import { useToast } from "@/hooks/use-toast";

export default function ExportOptions() {
  const [exportFormat, setExportFormat] = useState("pdf");
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Feature",
      description: "This functionality will be implemented in a future release.",
    });
  };

  const handleGoogleDrive = () => {
    toast({
      title: "Google Drive Integration",
      description: "Google Drive integration will be available soon.",
    });
  };

  const handleDropbox = () => {
    toast({
      title: "Dropbox Integration",
      description: "Dropbox integration will be available soon.",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export Options
      </h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">Download Format</h3>
        <RadioGroup 
          className="grid grid-cols-1 gap-4 sm:grid-cols-3" 
          defaultValue="pdf"
          value={exportFormat}
          onValueChange={setExportFormat}
        >
          <div className="relative bg-white border rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center">
              <RadioGroupItem value="pdf" id="format-pdf" />
              <Label htmlFor="format-pdf" className="ml-3 font-medium text-gray-700">
                PDF Format
              </Label>
            </div>
            <p className="mt-1 text-xs text-gray-500">Best for sharing and printing</p>
          </div>
          
          <div className="relative bg-white border rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center">
              <RadioGroupItem value="docx" id="format-docx" />
              <Label htmlFor="format-docx" className="ml-3 font-medium text-gray-700">
                Word (DOCX)
              </Label>
            </div>
            <p className="mt-1 text-xs text-gray-500">Editable in Microsoft Word</p>
          </div>
          
          <div className="relative bg-white border rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex items-center">
              <RadioGroupItem value="txt" id="format-txt" />
              <Label htmlFor="format-txt" className="ml-3 font-medium text-gray-700">
                Plain Text
              </Label>
            </div>
            <p className="mt-1 text-xs text-gray-500">Simple text version</p>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Cloud Storage</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleGoogleDrive}
            className="justify-center"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.6 66.85 10.45 73.5c.8 1.4 1.95 2.5 3.3 3.3 1.4.8 2.94 1.2 4.5 1.2h51.8c1.56 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65c.8-1.4.8-3.1 0-4.5l-3.85-6.65c-.8-1.4-1.95-2.5-3.3-3.3-1.4-.8-2.94-1.2-4.5-1.2H18.25c-1.56 0-3.1.4-4.5 1.2-1.35.8-2.5 1.9-3.3 3.3l-3.85 6.65c-.8 1.4-.8 3.1 0 4.5Z" fill="#4285F4" fillOpacity=".4"/>
              <path d="M35.75 17.85 20.65 2.75c-.8-.8-1.9-1.35-3.1-1.55-1.2-.2-2.4 0-3.5.5s-2 1.35-2.6 2.4c-.6 1.05-.9 2.25-.9 3.45v30.3c0 1.2.3 2.4.9 3.45.6 1.05 1.5 1.9 2.6 2.4s2.3.7 3.5.5c1.2-.2 2.3-.75 3.1-1.55l15.1-15.1c.8-.8 1.35-1.9 1.55-3.1.2-1.2 0-2.4-.5-3.5s-1.35-2-2.4-2.6c-1.05-.6-2.25-.9-3.45-.9s-2.4.3-3.45.9-1.9 1.5-2.4 2.6-.7 2.3-.5 3.5c.2 1.2.75 2.3 1.55 3.1Z" fill="#EA4335"/>
              <path d="M87.3 39c0-1.2-.3-2.4-.9-3.45-.6-1.05-1.5-1.9-2.6-2.4s-2.3-.7-3.5-.5c-1.2.2-2.3.75-3.1 1.55l-15.1 15.1c-.8.8-1.35 1.9-1.55 3.1-.2 1.2 0 2.4.5 3.5s1.35 2 2.4 2.6c1.05.6 2.25.9 3.45.9s2.4-.3 3.45-.9 1.9-1.5 2.4-2.6.7-2.3.5-3.5c-.2-1.2-.75-2.3-1.55-3.1L56.1 33.3c-.8-.8-1.9-1.35-3.1-1.55-1.2-.2-2.4 0-3.5.5s-2 1.35-2.6 2.4c-.6 1.05-.9 2.25-.9 3.45s.3 2.4.9 3.45c.6 1.05 1.5 1.9 2.6 2.4s2.3.7 3.5.5c1.2-.2 2.3-.75 3.1-1.55L71.2 28.3c.8-.8 1.35-1.9 1.55-3.1.2-1.2 0-2.4-.5-3.5s-1.35-2-2.4-2.6c-1.05-.6-2.25-.9-3.45-.9s-2.4.3-3.45.9-1.9 1.5-2.4 2.6-.7 2.3-.5 3.5c.2 1.2.75 2.3 1.55 3.1Z" fill="#4285F4"/>
              <path d="M35.75 60.15 20.65 75.25c-.8.8-1.9 1.35-3.1 1.55-1.2.2-2.4 0-3.5-.5s-2-1.35-2.6-2.4c-.6-1.05-.9-2.25-.9-3.45v-30.3c0-1.2.3-2.4.9-3.45.6-1.05 1.5-1.9 2.6-2.4s2.3-.7 3.5-.5c1.2.2 2.3.75 3.1 1.55l15.1 15.1c.8.8 1.35 1.9 1.55 3.1.2 1.2 0 2.4-.5 3.5s-1.35 2-2.4 2.6c-1.05.6-2.25.9-3.45.9s-2.4-.3-3.45-.9-1.9-1.5-2.4-2.6-.7-2.3-.5-3.5c.2-1.2.75-2.3 1.55-3.1Z" fill="#34A853"/>
              <path d="M51.55 39 36.45 23.9c-.8-.8-1.35-1.9-1.55-3.1-.2-1.2 0-2.4.5-3.5s1.35-2 2.4-2.6c1.05-.6 2.25-.9 3.45-.9s2.4.3 3.45.9 1.9 1.5 2.4 2.6.7 2.3.5 3.5c-.2 1.2-.75 2.3-1.55 3.1L31.35 39c-.8.8-1.35 1.9-1.55 3.1-.2 1.2 0 2.4.5 3.5s1.35 2 2.4 2.6c1.05.6 2.25.9 3.45.9s2.4-.3 3.45-.9 1.9-1.5 2.4-2.6.7-2.3.5-3.5c-.2-1.2-.75-2.3-1.55-3.1Z" fill="#FBBC05"/>
            </svg>
            Save to Google Drive
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDropbox}
            className="justify-center"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#0061FF" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h12V4H6Zm6 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
            </svg>
            Save to Dropbox
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">You'll need to authorize access to your cloud storage account.</p>
      </div>

      <div className="mt-6">
        <Button onClick={handleExport} className="w-full">
          Export Resume
        </Button>
      </div>
    </div>
  );
}
