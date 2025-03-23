import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DialogCustomSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string) => void;
}

export default function DialogCustomSection({ 
  open, 
  onOpenChange, 
  onAdd 
}: DialogCustomSectionProps) {
  const [sectionTitle, setSectionTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddSection = () => {
    if (!sectionTitle.trim()) {
      setError("Section title is required");
      return;
    }
    
    onAdd(sectionTitle);
    setSectionTitle("");
    setError(null);
  };

  const handleClose = () => {
    setSectionTitle("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Section</DialogTitle>
          <DialogDescription>
            Create a new custom section for your resume
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              placeholder="e.g., Projects, Certifications, Awards"
              value={sectionTitle}
              onChange={(e) => {
                setSectionTitle(e.target.value);
                if (error) setError(null);
              }}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAddSection}>
            Add Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
