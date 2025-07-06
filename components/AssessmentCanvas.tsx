"use client";

import React, { useRef, useState } from "react";
import { useComponentDragDrop } from "../helpers/useComponentDragDrop";
import { AssessmentComponent } from "../helpers/useAssessmentBuilder";
import styles from "./AssessmentCanvas.module.css";

interface AssessmentCanvasProps {
  components: AssessmentComponent[];
  onComponentPositionChange: (componentId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export const AssessmentCanvas: React.FC<AssessmentCanvasProps> = ({
  components,
  onComponentPositionChange,
  className,
}) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const { dragState } = useComponentDragDrop();
  const isDragging = dragState.isDragging;
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isDragging) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Placeholder for drop handling
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleCenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const renderComponent = (component: AssessmentComponent) => {
    const style = {
      position: 'absolute' as const,
      left: `${component.position.x * zoom + pan.x}px`,
      top: `${component.position.y * zoom + pan.y}px`,
      transform: `scale(${zoom})`,
      transformOrigin: 'top left',
      cursor: 'move',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#fff',
      minWidth: '120px',
      zIndex: 1,
    };

    return (
      <div
        key={component.id}
        style={style}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('componentId', component.id);
        }}
        onDragEnd={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            onComponentPositionChange(component.id, { x, y });
          }
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {component.title}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {component.content.substring(0, 50)}...
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`${styles.canvasContainer} ${className || ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className={styles.toolbar} dir="rtl">
        <div className={styles.toolbarTitle}>לוח ההערכה</div>
        <div className={styles.toolbarControls}>
          <button 
            className={styles.toolbarButton}
            onClick={handleZoomIn}
            title="זום פנימה"
          >
            🔍+
          </button>
          <button 
            className={styles.toolbarButton}
            onClick={handleZoomOut}
            title="זום החוצה"
          >
            🔍-
          </button>
          <button 
            className={styles.toolbarButton}
            onClick={handleCenter}
            title="מרכז"
          >
            🎯
          </button>
        </div>
      </div>
      
      <div 
        className={styles.canvas} 
        ref={canvasRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          minHeight: '400px',
        }}
      >
        {components.map(renderComponent)}
        
        {components.length === 0 && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#999',
            }}
          >
            <p>גרור רכיבים מהספרייה לכאן</p>
          </div>
        )}
      </div>
      
      <div className={styles.canvasHint} dir="rtl">
        <p>גרור רכיבים מהספרייה וסדר אותם על הלוח</p>
        <p>חבר רכיבים על ידי גרירה מאחד לאחר</p>
        <p>זום: {Math.round(zoom * 100)}%</p>
      </div>
    </div>
  );
};