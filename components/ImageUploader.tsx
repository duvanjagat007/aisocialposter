
import React, { useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  onImageUpload: (base64: string | null) => void;
  currentImage: string | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageUpload, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onImageUpload(base64);
    }
  };

  const handleRemoveImage = () => {
    onImageUpload(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="mt-1 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-md bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
          ) : (
             <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          )}
        </div>
        <div className="flex flex-col">
            <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {currentImage ? 'Change' : 'Upload'}
            </button>
            {currentImage && (
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                >
                    Remove
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
