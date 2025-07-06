
import { useState, useCallback } from "react";

// Define types for assessment components
export type AssessmentComponentType = 
  | "question-multiple-choice" 
  | "question-short-answer" 
  | "question-essay" 
  | "rubric-element" 
  | "instruction-block"
  | "section-header";

export interface AssessmentComponent {
  id: string;
  type: AssessmentComponentType;
  title: string;
  content: string;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected components
  config?: Record<string, any>; // Additional configuration specific to component type
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  components: AssessmentComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export function useAssessmentBuilder(initialAssessment?: Assessment) {
  // Initialize with empty assessment or provided one
  const [assessment, setAssessment] = useState<Assessment>(
    initialAssessment || {
      id: crypto.randomUUID(),
      title: "New Assessment",
      description: "",
      components: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  // Add a new component to the assessment
  const addComponent = useCallback((component: Omit<AssessmentComponent, "id">) => {
    const newComponent = {
      ...component,
      id: crypto.randomUUID(),
    };
    
    setAssessment(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
      updatedAt: new Date(),
    }));
    
    return newComponent.id;
  }, []);

  // Remove a component from the assessment
  const removeComponent = useCallback((componentId: string) => {
    setAssessment(prev => {
      // First filter out the component to be removed
      const filteredComponents = prev.components.filter(c => c.id !== componentId);
      
      // Then remove any connections to this component from remaining components
      const componentsWithCleanedConnections = filteredComponents.map(c => ({
        ...c,
        connections: c.connections.filter(id => id !== componentId)
      }));

      return {
        ...prev,
        components: componentsWithCleanedConnections,
        updatedAt: new Date(),
      };
    });
  }, []);

  // Update a component's properties
  const updateComponent = useCallback((componentId: string, updates: Partial<AssessmentComponent>) => {
    setAssessment(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === componentId ? { ...c, ...updates } : c
      ),
      updatedAt: new Date(),
    }));
  }, []);

  // Update component position
  const updateComponentPosition = useCallback((componentId: string, position: { x: number; y: number }) => {
    updateComponent(componentId, { position });
  }, [updateComponent]);

  // Connect two components
  const connectComponents = useCallback((sourceId: string, targetId: string) => {
    setAssessment(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === sourceId 
          ? { ...c, connections: [...c.connections, targetId] } 
          : c
      ),
      updatedAt: new Date(),
    }));
  }, []);

  // Disconnect two components
  const disconnectComponents = useCallback((sourceId: string, targetId: string) => {
    setAssessment(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === sourceId 
          ? { ...c, connections: c.connections.filter(id => id !== targetId) } 
          : c
      ),
      updatedAt: new Date(),
    }));
  }, []);

  // Update assessment metadata
  const updateAssessmentMetadata = useCallback((updates: Partial<Pick<Assessment, "title" | "description">>) => {
    setAssessment(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  }, []);

  // Generate final assessment document
  const generateAssessmentDocument = useCallback(() => {
    // This would generate a structured document based on the components
    // For now, we'll just return a simple representation
    return {
      title: assessment.title,
      description: assessment.description,
      sections: assessment.components.map(c => ({
        type: c.type,
        title: c.title,
        content: c.content,
        config: c.config,
      })),
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    };
  }, [assessment]);

  return {
    assessment,
    addComponent,
    removeComponent,
    updateComponent,
    updateComponentPosition,
    connectComponents,
    disconnectComponents,
    updateAssessmentMetadata,
    generateAssessmentDocument,
  };
}
