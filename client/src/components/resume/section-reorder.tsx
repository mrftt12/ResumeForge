import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
  visible: boolean;
  order: number;
}

interface SectionReorderProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onAddCustomSection: () => void;
}

export default function SectionReorder({ sections, onSectionsChange, onAddCustomSection }: SectionReorderProps) {
  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property for each item
    const updatedSections = items.map((item, index) => ({
      ...item,
      order: index,
    }));
    
    onSectionsChange(updatedSections);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          visible: !section.visible,
        };
      }
      return section;
    });
    
    onSectionsChange(updatedSections);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Resume Sections</h2>
      <p className="text-sm text-gray-500 mb-4">Drag to reorder sections or toggle visibility.</p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <ul
              className="space-y-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sortedSections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <li
                      className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="flex items-center">
                        <span 
                          className="drag-handle mr-3 text-gray-400 cursor-grab"
                          {...provided.dragHandleProps}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                          </svg>
                        </span>
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className={`p-1 rounded-md ${section.visible ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-600`}
                          onClick={() => toggleSectionVisibility(section.id)}
                        >
                          {section.visible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          )}
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      
      <Button
        variant="outline"
        onClick={onAddCustomSection}
        className="mt-4 text-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Custom Section
      </Button>
    </div>
  );
}
