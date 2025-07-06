"use client";

import { useState, useCallback } from "react";
import { AssessmentComponent, AssessmentComponentType } from "./useAssessmentBuilder";

// Temporary placeholder - PIXI.js implementation removed
export const useComponentDragDrop = () => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedComponent: null as AssessmentComponent | null,
    startPosition: { x: 0, y: 0 },
  });

  const handleLibraryItemDragStart = useCallback((componentType: string) => {
    setDragState({
      isDragging: true,
      draggedComponent: {
        id: `temp-${Date.now()}`,
        type: componentType as AssessmentComponentType,
        title: "New Component",
        content: "",
        position: { x: 0, y: 0 },
        connections: [],
      },
      startPosition: { x: 0, y: 0 },
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedComponent: null,
      startPosition: { x: 0, y: 0 },
    });
  }, []);

  return {
    dragState,
    handleLibraryItemDragStart,
    handleDragEnd,
  };
};

export {};