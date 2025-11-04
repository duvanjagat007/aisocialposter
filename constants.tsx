
import React from 'react';
import type { Platform, PlatformSelection, UserInput } from './types';

export const INITIAL_USER_INPUT: UserInput = {
  prompt: 'A new platform that will revolutionize your workflow and boost productivity by 300%. Our key feature is AI-powered task automation.',
  backgroundImage: null,
};

export const INITIAL_PLATFORM_SELECTION: PlatformSelection = {
  instagram: {
    'Post': true,
    'Story': false,
    'Reel': false,
  },
  facebook: {
    'Post': true,
    'Story': false,
  },
  linkedin: {
    'Post': false,
  },
  pinterest: {
    'Pin': false,
  },
};

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3"></circle><line x1="16.5" y1="7.5" x2="16.5" y2="7.501"></line></svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"></path></svg>
);
const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect><line x1="8" y1="11" x2="8" y2="16"></line><line x1="8" y1="8" x2="8" y2="8.01"></line><line x1="12" y1="16" x2="12" y2="11"></line><path d="M16 16v-3a2 2 0 0 0 -4 0"></path></svg>
);
const PinterestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="8" y1="20" x2="12" y2="11"></line><path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7"></path></svg>
);


export const PLATFORMS: { [key: string]: Platform } = {
  instagram: {
    name: 'Instagram',
    icon: <InstagramIcon />,
    sizes: [
      { name: 'Post', width: 1080, height: 1080 },
      { name: 'Story', width: 1080, height: 1920 },
      { name: 'Reel', width: 1080, height: 1920 },
    ],
  },
  facebook: {
    name: 'Facebook',
    icon: <FacebookIcon />,
    sizes: [
      { name: 'Post', width: 1200, height: 630 },
      { name: 'Story', width: 1080, height: 1920 },
    ],
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <LinkedinIcon />,
    sizes: [{ name: 'Post', width: 1200, height: 627 }],
  },
  pinterest: {
    name: 'Pinterest',
    icon: <PinterestIcon />,
    sizes: [{ name: 'Pin', width: 1000, height: 1500 }],
  },
};

export const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro', 'Raleway', 'Poppins', 'Inter',
  'Playfair Display', 'Merriweather', 'Nunito', 'Roboto Condensed', 'Ubuntu', 'Lobster', 'Pacifico',
  'Anton', 'Bebas Neue', 'Archivo',
];
