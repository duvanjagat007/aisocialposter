

import React, { useState } from 'react';
import type { GeneratedText, PlatformSelection, PlatformSize, ElementPositions, ElementPosition, CustomDesign } from '../types';
import { PLATFORMS } from '../constants';
import { Poster } from './Poster';

interface PreviewAreaProps {
  generatedText: GeneratedText | null;
  logo: string | null;
  customDesigns: Record<string, CustomDesign> | null;
  generatedImage: string | null;
  platformSelection: PlatformSelection;
  isLoading: boolean;
  error: string | null;
  onElementUpdate: (posterKey: string, element: keyof ElementPositions, position: Partial<ElementPosition>) => void;
  selectedElementKey: { posterKey: string; element: keyof ElementPositions } | null;
  onSelectElement: (posterKey: string, element: keyof ElementPositions | null) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  generatedText, logo, customDesigns, generatedImage, platformSelection, isLoading, error,
  onElementUpdate, selectedElementKey, onSelectElement
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (posterKey: string, size: PlatformSize, format: 'png' | 'jpeg' | 'pdf') => {
    const exportId = `${posterKey}-${format}`;
    setIsExporting(exportId);

    const originalElement = document.querySelector(`#${posterKey} [data-poster-content="true"]`) as HTMLElement;
    if (!originalElement) {
        console.error("Poster element not found!");
        setIsExporting(null);
        return;
    }

    const clone = originalElement.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0px';
    document.body.appendChild(clone);

    try {
        // Fix: Access html2canvas from the window object.
        const canvas = await window.html2canvas(clone, {
            useCORS: true,
            scale: 2, // Capture at 2x resolution for better quality
            backgroundColor: null,
        });

        const downloadImage = (dataUrl: string, fileName: string) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const fileName = `${posterKey}.${format}`;

        if (format === 'png' || format === 'jpeg') {
            const mimeType = `image/${format}`;
            const dataUrl = canvas.toDataURL(mimeType, 0.95);
            downloadImage(dataUrl, fileName);
        } else if (format === 'pdf') {
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            // Fix: Access jspdf from the window object.
            const { jsPDF } = window.jspdf;
            const orientation = size.width > size.height ? 'l' : 'p';
            const pdf = new jsPDF({
                orientation,
                unit: 'px',
                format: [size.width, size.height]
            });
            pdf.addImage(imgData, 'JPEG', 0, 0, size.width, size.height);
            pdf.save(fileName);
        }
    } catch (err) {
        console.error("Export failed:", err);
        alert("Sorry, there was an error exporting your poster. Please try again.");
    } finally {
        document.body.removeChild(clone);
        setIsExporting(null);
    }
  };

  const selectedPlatforms: ({ platformName: string; size: PlatformSize; posterKey: string })[] = [];
  Object.entries(platformSelection).forEach(([platformKey, sizes]) => {
    const platformData = PLATFORMS[platformKey];
    if (platformData) {
      Object.entries(sizes).forEach(([sizeName, isSelected]) => {
        if (isSelected) {
          const sizeData = platformData.sizes.find(s => s.name === sizeName);
          if (sizeData) {
            selectedPlatforms.push({ 
                platformName: platformData.name, 
                size: sizeData,
                posterKey: `${platformKey}-${sizeName}`
            });
          }
        }
      });
    }
  });


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 mb-4"></div>
          <style>{`.loader { border-top-color: #4f46e5; animation: spinner 1.5s linear infinite; } @keyframes spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h2 className="text-xl font-semibold text-slate-700">AI is creating magic...</h2>
          <p className="text-slate-500 mt-2">Generating copy, design concepts, and images. This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-red-50 p-8 rounded-lg animate-fadeIn">
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-xl font-semibold text-red-700">Oops, something went wrong!</h2>
          <p className="text-red-600 mt-2 max-w-md">{error}</p>
        </div>
      );
    }
    
    if (!customDesigns || !generatedText) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h2 className="text-xl font-semibold text-slate-700">Your Posters Will Appear Here</h2>
            <p className="text-slate-500 mt-2 max-w-sm">Enter a prompt on the left, select your platforms, and click "Generate Posters" to start.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-row flex-wrap justify-center items-start gap-x-16 gap-y-20">
        {selectedPlatforms.map(({ platformName, size, posterKey }, index) => {
            const customDesign = customDesigns[posterKey];
            if(!customDesign) return null;

            return (
              <div key={posterKey} className="space-y-4 animate-fadeIn" style={{ animationDelay: `${index * 100}ms`}}>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm">{platformName} {size.name} <span className="font-normal text-slate-500">({size.width}x{size.height})</span></h3>
                  <Poster
                    posterKey={posterKey}
                    platform={size}
                    generatedText={generatedText}
                    logo={logo}
                    designConcept={customDesign.design}
                    generatedImage={generatedImage}
                    elementPositions={customDesign.positions}
                    onElementUpdate={onElementUpdate}
                    isSelected={(element) => selectedElementKey?.posterKey === posterKey && selectedElementKey?.element === element}
                    onSelectElement={onSelectElement}
                  />
                </div>
                <ExportControls posterKey={posterKey} size={size} onExport={handleExport} isExporting={isExporting} />
              </div>
            )
        })}
      </div>
    );
  };

  return (
    <div className="w-full lg:flex-1 bg-transparent p-16 overflow-y-auto h-[calc(100vh-73px)]">
      {renderContent()}
    </div>
  );
};

const ExportControls: React.FC<{
  posterKey: string;
  size: PlatformSize;
  onExport: (posterKey: string, size: PlatformSize, format: 'png' | 'jpeg' | 'pdf') => void;
  isExporting: string | null;
}> = ({ posterKey, size, onExport, isExporting }) => {
  const formats: ('png' | 'jpeg' | 'pdf')[] = ['png', 'jpeg', 'pdf'];
  return (
    <div className="bg-white/80 backdrop-blur-lg p-2 rounded-lg shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600 uppercase">Export</p>
            <div className="flex items-center space-x-1">
                {formats.map(format => {
                    const exportId = `${posterKey}-${format}`;
                    const currentlyExporting = isExporting === exportId;
                    return (
                        <button 
                            key={format}
                            onClick={() => onExport(posterKey, size, format)}
                            disabled={!!isExporting}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                           {currentlyExporting ? '...' : format.toUpperCase()}
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  )
}