import type React from 'react';

// Declare global libraries loaded from CDN
// Fix: Augment the Window interface to include `html2canvas` and `jspdf`. This resolves TypeScript errors by making the compiler aware that these properties exist on the global `window` object.
declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

export interface UserInput {
  prompt: string;
  backgroundImage: string | null; // base64 string
}

export interface GeneratedText {
  heading: string;
  description: string;
  cta: string;
}

export interface PlatformSize {
  name: string;
  width: number;
  height: number;
}

export interface Platform {
  name: string;
  icon: React.ReactElement;
  sizes: PlatformSize[];
}

export type PlatformSelection = {
  [platformKey: string]: {
    [sizeName: string]: boolean;
  };
};

export interface DesignConcept {
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  layoutStyle: 'centered' | 'left-aligned-image-right' | 'image-top-text-bottom';
  imagePrompt: string;
}

export interface ElementPosition {
  x: number; // percentage
  y: number; // percentage
  size: number; // multiplier for logo, legacy for text
  zIndex: number;
  width?: number; // percentage
  // Text specific properties
  fontSize: number; // in px
  color: string | null; // override global color
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  letterSpacing: number; // in em
  lineHeight: number; // multiplier
}


export interface ElementPositions {
  heading: ElementPosition;
  description: ElementPosition;
  cta: ElementPosition;
  logo: ElementPosition;
}

export interface CustomDesign {
    design: DesignConcept;
    positions: ElementPositions;
}