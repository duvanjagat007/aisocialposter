import React, { useState, useEffect } from 'react';
import type { UserInput, PlatformSelection, DesignConcept, CustomDesign, ElementPositions, GeneratedText, ElementPosition } from '../types';
import { PLATFORMS, GOOGLE_FONTS } from '../constants';
import { ImageUploader } from './ImageUploader';

interface ControlPanelProps {
  userInput: UserInput;
  setUserInput: React.Dispatch<React.SetStateAction<UserInput>>;
  platformSelection: PlatformSelection;
  setPlatformSelection: React.Dispatch<React.SetStateAction<PlatformSelection>>;
  onGenerate: () => void;
  isLoading: boolean;
  logo: string | null;
  setLogo: React.Dispatch<React.SetStateAction<string | null>>;
  customDesigns: Record<string, CustomDesign> | null;
  onGlobalDesignUpdate: (updates: Partial<DesignConcept>) => void;
  generatedImage: string | null;
  setGeneratedImage: React.Dispatch<React.SetStateAction<string | null>>;
  syncEdits: boolean;
  setSyncEdits: React.Dispatch<React.SetStateAction<boolean>>;
  selectedElementKey: { posterKey: string; element: keyof ElementPositions } | null;
  onElementUpdate: (posterKey: string, element: keyof ElementPositions, updates: any) => void;
  generatedText: GeneratedText | null;
  setGeneratedText: React.Dispatch<React.SetStateAction<GeneratedText | null>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  userInput, setUserInput, platformSelection, setPlatformSelection, onGenerate, isLoading, logo, setLogo,
  customDesigns, onGlobalDesignUpdate, generatedImage, setGeneratedImage, syncEdits, setSyncEdits,
  selectedElementKey, onElementUpdate, generatedText, setGeneratedText
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>, platformKey: string) => {
    setPlatformSelection((prev) => ({
      ...prev,
      [platformKey]: { ...prev[platformKey], [e.target.name]: e.target.checked },
    }));
  };
  
  const selectedElement = selectedElementKey && customDesigns ? customDesigns[selectedElementKey.posterKey].positions[selectedElementKey.element] : null;
  const designConcept = customDesigns ? Object.values(customDesigns)[0].design : null;
  
  return (
    <div className="w-full lg:w-[420px] bg-white/80 backdrop-blur-lg border-r border-slate-200/80 p-8 space-y-8 overflow-y-auto h-[calc(100vh-73px)]">
      
      <Accordion title="1. Poster Content" defaultOpen>
        <div className="space-y-4">
          <TextAreaGroup label="Text Prompt" name="prompt" value={userInput.prompt} onChange={handleInputChange} rows={4} placeholder="e.g., A summer sale for handmade pottery." />
        </div>
      </Accordion>
      
      <Accordion title="2. Branding & Images">
        <div className="space-y-4">
          <ImageUploader label="Upload Background Image (Optional)" onImageUpload={(b64) => setUserInput(prev => ({ ...prev, backgroundImage: b64 }))} currentImage={userInput.backgroundImage}/>
          <ImageUploader label="Upload Logo (Optional)" onImageUpload={setLogo} currentImage={logo}/>
        </div>
      </Accordion>

      <Accordion title="3. Platforms & Sizes">
        <div className="space-y-3">
          {Object.entries(PLATFORMS).map(([key, data]) => (
            <div key={key}>
              <h3 className="font-semibold text-slate-800 flex items-center mb-2 text-sm">
                {data.icon}
                <span className="ml-2">{data.name}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {data.sizes.map((size) => (
                  <Checkbox key={size.name} id={`${key}-${size.name}`} name={size.name} checked={platformSelection[key]?.[size.name] ?? false} onChange={(e) => handlePlatformChange(e, key)} label={`${size.name}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {designConcept && (
        <Accordion title="4. Customize Design" defaultOpen>
          <div className="space-y-6">
            <ToggleSwitch label="Sync Edits" enabled={syncEdits} onChange={setSyncEdits} helpText="Apply edits to all posters simultaneously." />
            
            <Section title="Global Styles">
              <div className="flex space-x-4">
                  <ColorPicker label="Background" value={designConcept.backgroundColor} onChange={(value) => onGlobalDesignUpdate({ backgroundColor: value })} />
                  <ColorPicker label="Text" value={designConcept.textColor} onChange={(value) => onGlobalDesignUpdate({ textColor: value })} />
              </div>
              <FontSelector label="Heading Font" fonts={GOOGLE_FONTS} value={designConcept.headingFont} onChange={(value) => onGlobalDesignUpdate({ headingFont: value })} />
              <FontSelector label="Body Font" fonts={GOOGLE_FONTS} value={designConcept.bodyFont} onChange={(value) => onGlobalDesignUpdate({ bodyFont: value })} />
              <ImageUploader label="Change Background" onImageUpload={setGeneratedImage} currentImage={generatedImage} />
            </Section>

            {selectedElementKey && selectedElement && (
                <div className="animate-fadeIn">
                 <ElementEditor 
                    elementKey={selectedElementKey.element}
                    elementProps={selectedElement} 
                    posterKey={selectedElementKey.posterKey}
                    onUpdate={onElementUpdate}
                    generatedText={generatedText}
                    setGeneratedText={setGeneratedText}
                 />
                 </div>
            )}
          </div>
        </Accordion>
      )}

      <div className="pt-4 sticky bottom-0 bg-white/80 backdrop-blur-lg pb-2 -mb-2">
        <GenerateButton isLoading={isLoading} onClick={onGenerate} />
      </div>
    </div>
  );
};

// ... (UI Components: Accordion, Section, ElementEditor, etc.)
const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-200/80 last:border-b-0 -mx-8 px-8">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4">
                <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
                <svg className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
               <div className="pb-6">
                 {children}
               </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const ElementEditor: React.FC<{
    elementKey: keyof ElementPositions,
    elementProps: ElementPosition,
    posterKey: string,
    onUpdate: Function,
    generatedText: GeneratedText | null,
    setGeneratedText: Function
}> = ({ elementKey, elementProps, posterKey, onUpdate, generatedText, setGeneratedText }) => {
    const isTextElement = ['heading', 'description', 'cta'].includes(elementKey);

    const handleTextContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!generatedText) return;
        setGeneratedText((prev: GeneratedText | null) => ({...prev!, [elementKey as keyof GeneratedText]: e.target.value}));
    };

    return (
        <Section title={`Element Styles (${elementKey.charAt(0).toUpperCase() + elementKey.slice(1)})`}>
            {isTextElement && (
                <TextInput label="Text Content" value={generatedText?.[elementKey as keyof GeneratedText] || ''} onChange={handleTextContentChange} />
            )}
            <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Font Size" value={elementProps.fontSize} onChange={v => onUpdate(posterKey, elementKey, { fontSize: v })} min={8} max={500} suffix="px" />
                <ColorPicker label="Color" value={elementProps.color || '#000000'} onChange={v => onUpdate(posterKey, elementKey, { color: v })} />
            </div>

            {isTextElement && (
                <>
                <div className="grid grid-cols-2 gap-4">
                     <SliderInput label="Letter Spacing" value={elementProps.letterSpacing} onChange={v => onUpdate(posterKey, elementKey, { letterSpacing: v })} min={-0.1} max={0.5} step={0.01} suffix="em" />
                     <SliderInput label="Line Height" value={elementProps.lineHeight} onChange={v => onUpdate(posterKey, elementKey, { lineHeight: v })} min={0.8} max={3} step={0.1} />
                </div>
                 <div className="flex space-x-2">
                    <ToggleButton label="Bold" active={elementProps.fontWeight === 'bold'} onToggle={() => onUpdate(posterKey, elementKey, { fontWeight: elementProps.fontWeight === 'bold' ? 'normal' : 'bold' })} />
                    <ToggleButton label="Italic" active={elementProps.fontStyle === 'italic'} onToggle={() => onUpdate(posterKey, elementKey, { fontStyle: elementProps.fontStyle === 'italic' ? 'normal' : 'italic' })} />
                    <ToggleButton label="Underline" active={elementProps.textDecoration === 'underline'} onToggle={() => onUpdate(posterKey, elementKey, { textDecoration: elementProps.textDecoration === 'underline' ? 'none' : 'underline' })} />
                </div>
                </>
            )}

            <AlignmentTools onUpdate={onUpdate} posterKey={posterKey} elementKey={elementKey} elementProps={elementProps} />
            <LayerTools zIndex={elementProps.zIndex} onUpdate={onUpdate} posterKey={posterKey} elementKey={elementKey} />
        </Section>
    );
};

const AlignmentTools: React.FC<{onUpdate: Function, posterKey: string, elementKey: keyof ElementPositions, elementProps: ElementPosition}> = ({onUpdate, posterKey, elementKey, elementProps}) => {
    const margin = 5;
    const handleHorizontalAlign = (align: 'left' | 'center' | 'right') => {
        if (align === 'left') {
            onUpdate(posterKey, elementKey, { x: margin, textAlign: 'left' });
        } else if (align === 'center') {
            onUpdate(posterKey, elementKey, { x: 50, textAlign: 'center' });
        } else { // right
            onUpdate(posterKey, elementKey, { x: 100 - margin, textAlign: 'right' });
        }
    };

    const handleVerticalAlign = (align: 'top' | 'middle' | 'bottom') => {
        const newY = align === 'top' ? margin : align === 'middle' ? 50 : 100 - margin;
        onUpdate(posterKey, elementKey, { y: newY });
    };

    const icons = {
        'align-left': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'align-center': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'align-right': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'align-top': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform -rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'align-middle': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform -rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'align-bottom': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform -rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Alignment</label>
            <div className="grid grid-cols-3 gap-2">
                <button title="Align Left" onClick={() => handleHorizontalAlign('left')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex justify-center items-center transition-colors">{icons['align-left']}</button>
                <button title="Align Center" onClick={() => handleHorizontalAlign('center')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex justify-center items-center transition-colors">{icons['align-center']}</button>
                <button title="Align Right" onClick={() => handleHorizontalAlign('right')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex justify-center items-center transition-colors">{icons['align-right']}</button>
                <button title="Align Top" onClick={() => handleVerticalAlign('top')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex justify-center items-center transition-colors">{icons['align-top']}</button>
                <button title="Align Middle" onClick={() => handleVerticalAlign('middle')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex justify-center items-center transition-colors">{icons['align-middle']}</button>
                <button title="Align Bottom" onClick={() => handleVerticalAlign('bottom')} className="p-2 bg-white border border-slate-200 shadow-sm rounded-md hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex justify-center items-center transition-colors">{icons['align-bottom']}</button>
            </div>
        </div>
    );
};

const LayerTools: React.FC<{zIndex: number, onUpdate: Function, posterKey: string, elementKey: string}> = ({zIndex, onUpdate, posterKey, elementKey}) => (
     <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">Layering</label>
        <div className="flex space-x-2">
            <button onClick={() => onUpdate(posterKey, elementKey, { zIndex: zIndex + 1 })} className="flex-1 p-2 bg-slate-100 rounded-md hover:bg-slate-200 text-sm transition-colors">Bring Forward</button>
            <button onClick={() => onUpdate(posterKey, elementKey, { zIndex: zIndex - 1 })} className="flex-1 p-2 bg-slate-100 rounded-md hover:bg-slate-200 text-sm transition-colors">Send Backward</button>
        </div>
    </div>
);


const GenerateButton: React.FC<{ isLoading: boolean; onClick: () => void; }> = ({ isLoading, onClick }) => (
    <button onClick={onClick} disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:from-indigo-400 disabled:to-purple-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform disabled:transform-none disabled:shadow-none">
        {isLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Designing...</>) : '✨ Generate Posters'}
    </button>
);
const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; helpText?: string; }> = ({ label, enabled, onChange, helpText }) => (
    <div>
        <div className="flex items-center justify-between"><span className="font-medium text-slate-700 text-sm">{label}</span><button type="button" className={`${enabled ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`} role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}><span aria-hidden="true" className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} /></button></div>
        {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
    </div>
);
const ColorPicker: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div className="flex-1">
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <div className="relative"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="p-1 h-10 w-full border border-slate-300 rounded-md cursor-pointer"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono uppercase text-slate-500 pointer-events-none">{value}</span></div>
    </div>
);
const FontSelector: React.FC<{ label: string; fonts: string[]; value: string; onChange: (value: string) => void; }> = ({ label, fonts, value, onChange }) => (
    <div><label className="block text-sm font-medium text-slate-600 mb-1">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-white rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"><option value="">Select Font</option>{fonts.map(font => <option key={font} value={font}>{font}</option>)}</select></div>
);
const TextAreaGroup: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number, placeholder?: string}> = ({ label, name, value, onChange, rows = 3, placeholder }) => (
    <div><label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1">{label}</label><textarea id={name} name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"/></div>
);
const Checkbox: React.FC<{ id: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }> = ({ id, name, checked, onChange, label }) => (
    <div className="relative"><input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} className="sr-only peer"/><label htmlFor={id} className={`flex items-center justify-center p-2 text-center text-slate-600 bg-white border rounded-lg cursor-pointer transition-all ${checked ? 'border-indigo-600 text-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}><span className="text-xs font-semibold leading-tight">{label}</span></label></div>
);
const TextInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div><label className="block text-sm font-medium text-slate-600 mb-1">{label}</label><input type="text" value={value} onChange={onChange} className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm" /></div>
);
const NumberInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string; }> = ({ label, value, onChange, min, max, suffix }) => (
    <div><label className="block text-sm font-medium text-slate-600 mb-1">{label}</label><div className="relative"><input type="number" value={value} onChange={e => onChange(parseInt(e.target.value, 10))} min={min} max={max} className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm" />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>}</div></div>
);
const SliderInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string }> = ({ label, value, onChange, min, max, step, suffix }) => (
    <div><label className="block text-sm font-medium text-slate-600 mb-1">{label} ({value}{suffix})</label><input type="range" value={value} onChange={e => onChange(parseFloat(e.target.value))} min={min} max={max} step={step} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" /></div>
);
const ToggleButton: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
    <button onClick={onToggle} className={`flex-1 p-2 text-sm rounded-md transition ${active ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 hover:bg-slate-200'}`}>{label}</button>
);