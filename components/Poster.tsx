import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GeneratedText, DesignConcept, PlatformSize, ElementPositions, ElementPosition } from '../types';

interface PosterProps {
  posterKey: string;
  platform: PlatformSize;
  generatedText: GeneratedText;
  logo: string | null;
  designConcept: DesignConcept;
  generatedImage: string | null;
  elementPositions: ElementPositions;
  onElementUpdate: (posterKey: string, element: keyof ElementPositions, updates: Partial<ElementPosition>) => void;
  isSelected: (element: keyof ElementPositions) => boolean;
  onSelectElement: (posterKey: string, element: keyof ElementPositions | null) => void;
}

type ActiveAction = 
  | { type: 'drag'; element: keyof ElementPositions }
  | { type: 'resize'; element: keyof ElementPositions; startX: number; startY: number; startSize: number };

export const Poster: React.FC<PosterProps> = ({
  posterKey, platform, generatedText, logo, designConcept, generatedImage, elementPositions,
  onElementUpdate, isSelected, onSelectElement,
}) => {
  const { width, height } = platform;
  const { backgroundColor, textColor, headingFont, bodyFont } = designConcept;
  const { heading, description, cta } = generatedText;
  
  const scale = 350 / width;
  const posterRef = useRef<HTMLDivElement>(null);
  const [activeAction, setActiveAction] = useState<ActiveAction | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, element: keyof ElementPositions) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveAction({ type: 'drag', element });
      onSelectElement(posterKey, element);
  }, [posterKey, onSelectElement]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, element: keyof ElementPositions) => {
    e.preventDefault();
    e.stopPropagation();
    const isLogo = element === 'logo';
    const startSize = isLogo ? elementPositions[element].size : elementPositions[element].fontSize;
    setActiveAction({ type: 'resize', element, startX: e.clientX, startY: e.clientY, startSize });
    onSelectElement(posterKey, element);
  }, [elementPositions, posterKey, onSelectElement]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!activeAction || !posterRef.current) return;
        
        const posterRect = posterRef.current.getBoundingClientRect();
        
        if (activeAction.type === 'drag') {
            const el = activeAction.element;
            const targetElement = posterRef.current?.querySelector(`[data-element-id="${el}"]`) as HTMLElement;
            if (!targetElement) return;

            const elemRect = targetElement.getBoundingClientRect();
            const parentScale = posterRect.width / width;

            const relativeX = (e.clientX - posterRect.left) / parentScale;
            const relativeY = (e.clientY - posterRect.top) / parentScale;

            const xPercent = (relativeX / width) * 100;
            const yPercent = (relativeY / height) * 100;
            
            const clampedX = Math.max(0, Math.min(100, xPercent));
            const clampedY = Math.max(0, Math.min(100, yPercent));
            onElementUpdate(posterKey, activeAction.element, { x: clampedX, y: clampedY });
        } else if (activeAction.type === 'resize') {
            const dx = e.clientX - activeAction.startX;
            const distance = dx; // Simple horizontal distance for resizing
            const sensitivity = activeAction.element === 'logo' ? 200 : 100;
            const sizeChange = distance / sensitivity;
            const newSize = Math.max(0.1, activeAction.startSize + sizeChange);
            const propToUpdate = activeAction.element === 'logo' ? 'size' : 'fontSize';
            onElementUpdate(posterKey, activeAction.element, { [propToUpdate]: newSize });
        }
    };

    const handleMouseUp = () => {
        setActiveAction(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeAction, onElementUpdate, posterKey, width, height]);
  
  const DraggableElement = ({elementType, children, style}: {elementType: keyof ElementPositions, children: React.ReactNode, style: React.CSSProperties}) => {
    const { x, y, zIndex, textAlign } = elementPositions[elementType];
    
    const getTransform = () => {
      let xTransform = '-50%';
      if (textAlign === 'left') {
        xTransform = '0%';
      } else if (textAlign === 'right') {
        xTransform = '-100%';
      }
      return `translate(${xTransform}, -50%)`;
    };

    return (
        <div 
            data-element-id={elementType}
            className={`absolute ${isSelected(elementType) ? 'outline-dashed outline-1 outline-indigo-500 animate-pulse-outline' : 'outline-transparent'}`}
            style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: getTransform(),
                cursor: activeAction?.type === 'drag' && activeAction.element === elementType ? 'grabbing' : 'grab',
                zIndex,
                ...style,
            }}
            onMouseDown={(e) => handleMouseDown(e, elementType)}
        >
            {children}
            {isSelected(elementType) && (
                <div 
                    className="absolute -right-1 -bottom-1 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, elementType)}
                />
            )}
        </div>
    )
  }

  const getTextStyle = (el: ElementPosition) => ({
    fontFamily: `'${el.textAlign === 'left' || el.textAlign === 'right' ? bodyFont : headingFont}', sans-serif`,
    fontSize: `${el.fontSize}px`,
    color: el.color || textColor,
    textAlign: el.textAlign,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    textDecoration: el.textDecoration,
    letterSpacing: `${el.letterSpacing}em`,
    lineHeight: el.lineHeight,
  });

  return (
    <div
      id={posterKey}
      className="shadow-lg rounded-xl overflow-hidden select-none bg-white"
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
      }}
      ref={posterRef}
    >
      <div
        data-poster-content="true"
        className="origin-top-left"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          backgroundColor,
        }}
        onClick={() => onSelectElement(posterKey, null)}
      >
          <div className="relative w-full h-full">
            {generatedImage && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${generatedImage})` }} />}
            
            {logo && (
                <DraggableElement elementType="logo" style={{width: `${(elementPositions.logo.width || 15) * elementPositions.logo.size}%`}}>
                    <img src={logo} alt="brand logo" className="max-h-full max-w-full pointer-events-none w-full h-auto"/>
                </DraggableElement>
            )}

            <DraggableElement elementType="heading" style={{...getTextStyle(elementPositions.heading), whiteSpace: 'pre-wrap', width: `${elementPositions.heading.width || 90}%`}}>
              {heading}
            </DraggableElement>

            <DraggableElement elementType="description" style={{...getTextStyle(elementPositions.description), whiteSpace: 'pre-wrap', width: `${elementPositions.description.width || 80}%`}}>
              {description}
            </DraggableElement>

            <DraggableElement elementType="cta" style={{
                ...getTextStyle(elementPositions.cta),
                backgroundColor: elementPositions.cta.color ? 'transparent' : textColor,
                color: elementPositions.cta.color || backgroundColor,
                padding: '0.75em 1.5em',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
            }}>
              {cta}
            </DraggableElement>
          </div>
      </div>
    </div>
  );
};