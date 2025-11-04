import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PreviewArea } from './components/PreviewArea';
import { generateDesignAndImage } from './services/geminiService';
import type { DesignConcept, UserInput, PlatformSelection, GeneratedText, ElementPositions, ElementPosition, CustomDesign } from './types';
import { INITIAL_USER_INPUT, INITIAL_PLATFORM_SELECTION } from './constants';

const getInitialPositions = (layoutStyle: DesignConcept['layoutStyle'], posterWidth: number): ElementPositions => {
  const basePositions: ElementPositions = {
      logo: { x: 50, y: 15, size: 1, zIndex: 10, fontSize: 40, color: null, textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 0, lineHeight: 1.2, width: 15 },
      heading: { x: 50, y: 45, size: 1, zIndex: 10, fontSize: posterWidth * 0.08, color: null, textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 0, lineHeight: 1.2, width: 90 },
      description: { x: 50, y: 55, size: 1, zIndex: 10, fontSize: posterWidth * 0.035, color: null, textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 0, lineHeight: 1.2, width: 80 },
      cta: { x: 50, y: 65, size: 1, zIndex: 10, fontSize: posterWidth * 0.04, color: null, textAlign: 'center', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none', letterSpacing: 0, lineHeight: 1.2, width: undefined },
  };

  switch (layoutStyle) {
    case 'left-aligned-image-right':
      const margin = 5;
      const contentWidth = 45;
      return {
        ...basePositions,
        logo: { 
          ...basePositions.logo, 
          textAlign: 'left', 
          x: margin, 
          y: 15, 
          width: 15 
        },
        heading: { 
          ...basePositions.heading, 
          textAlign: 'left', 
          x: margin, 
          y: 40, 
          width: contentWidth 
        },
        description: { 
          ...basePositions.description, 
          textAlign: 'left', 
          x: margin, 
          y: 55, 
          width: contentWidth 
        },
        cta: { 
          ...basePositions.cta, 
          textAlign: 'left', 
          x: margin, 
          y: 70 
        },
      };
    case 'image-top-text-bottom':
       return {
        ...basePositions,
        logo: { ...basePositions.logo, y: 60 },
        heading: { ...basePositions.heading, y: 70 },
        description: { ...basePositions.description, y: 80 },
        cta: { ...basePositions.cta, y: 90 },
      };
    case 'centered':
    default:
      return basePositions;
  }
};

function App() {
  const [userInput, setUserInput] = useState<UserInput>(INITIAL_USER_INPUT);
  const [platformSelection, setPlatformSelection] = useState<PlatformSelection>(INITIAL_PLATFORM_SELECTION);
  const [generatedText, setGeneratedText] = useState<GeneratedText | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customDesigns, setCustomDesigns] = useState<Record<string, CustomDesign> | null>(null);
  const [syncEdits, setSyncEdits] = useState<boolean>(true);
  const [selectedElementKey, setSelectedElementKey] = useState<{ posterKey: string; element: keyof ElementPositions } | null>(null);


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCustomDesigns(null);
    setGeneratedText(null);
    setSelectedElementKey(null);
    
    const backgroundImage = userInput.backgroundImage;

    try {
      const { design, image, generatedText } = await generateDesignAndImage(userInput, backgroundImage);
      
      const newCustomDesigns: Record<string, CustomDesign> = {};

      Object.entries(platformSelection).forEach(([platformKey, sizes]) => {
          Object.entries(sizes).forEach(([sizeName, isSelected]) => {
              if (isSelected) {
                  const posterKey = `${platformKey}-${sizeName}`;
                  // Assuming a base width of 1080 for initial font scaling. This is arbitrary but consistent.
                  const initialPositions = getInitialPositions(design.layoutStyle, 1080);
                  newCustomDesigns[posterKey] = {
                      design: { ...design },
                      positions: JSON.parse(JSON.stringify(initialPositions)) // Deep copy
                  };
              }
          });
      });
      
      setCustomDesigns(newCustomDesigns);
      setGeneratedText(generatedText);
      setGeneratedImage(image);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, platformSelection]);

  const handleGlobalDesignUpdate = useCallback((updates: Partial<DesignConcept>) => {
    setCustomDesigns(prev => {
        if (!prev) return null;
        const nextState = { ...prev };
        for (const key in nextState) {
            nextState[key] = { ...nextState[key], design: { ...nextState[key].design, ...updates }};
        }
        return nextState;
    });
  }, []);

  const handleElementUpdate = useCallback((
      posterKey: string, 
      element: keyof ElementPositions, 
      updates: Partial<ElementPosition>
  ) => {
    setCustomDesigns(prev => {
        if (!prev) return null;
        const nextState = { ...prev };

        const updateElementInPoster = (key: string) => {
            if (nextState[key]) {
                 nextState[key] = {
                    ...nextState[key],
                    positions: {
                        ...nextState[key].positions,
                        [element]: { ...nextState[key].positions[element], ...updates }
                    }
                };
            }
        };

        if (syncEdits) {
            // Apply update to all active posters
            for (const key in nextState) {
                updateElementInPoster(key);
            }
        } else {
            // Apply update to the specific poster
            updateElementInPoster(posterKey);
        }
        return nextState;
    });
  }, [syncEdits]);

  // Fix: Create a handler function to correctly update the selected element state.
  const handleSelectElement = useCallback((posterKey: string, element: keyof ElementPositions | null) => {
    if (element) {
      setSelectedElementKey({ posterKey, element });
    } else {
      setSelectedElementKey(null);
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-100 min-h-screen font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text tracking-tight">
             AI Social Poster Designer
          </h1>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        <div className="animate-slideInLeft">
          <ControlPanel
            userInput={userInput}
            setUserInput={setUserInput}
            platformSelection={platformSelection}
            setPlatformSelection={setPlatformSelection}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            logo={logo}
            setLogo={setLogo}
            customDesigns={customDesigns}
            onGlobalDesignUpdate={handleGlobalDesignUpdate}
            generatedImage={generatedImage}
            setGeneratedImage={setGeneratedImage}
            syncEdits={syncEdits}
            setSyncEdits={setSyncEdits}
            selectedElementKey={selectedElementKey}
            onElementUpdate={handleElementUpdate}
            generatedText={generatedText}
            setGeneratedText={setGeneratedText}
          />
        </div>
        <div className="flex-1 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <PreviewArea
            generatedText={generatedText}
            logo={logo}
            customDesigns={customDesigns}
            generatedImage={generatedImage}
            platformSelection={platformSelection}
            isLoading={isLoading}
            error={error}
            onElementUpdate={handleElementUpdate}
            selectedElementKey={selectedElementKey}
            onSelectElement={handleSelectElement}
          />
        </div>
      </main>
    </div>
  );
}

export default App;