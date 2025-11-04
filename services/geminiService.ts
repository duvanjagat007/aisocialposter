
import { GoogleGenAI, Type } from '@google/genai';
import type { UserInput, DesignConcept, GeneratedText } from '../types';
import { GOOGLE_FONTS } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const textSchema = {
    type: Type.OBJECT,
    properties: {
        heading: { type: Type.STRING, description: 'A catchy, concise headline for the social media post (max 10 words).' },
        description: { type: Type.STRING, description: 'A compelling description for the social media post (max 30 words).' },
        cta: { type: Type.STRING, description: 'A clear and short call-to-action (e.g., "Learn More", "Shop Now").' },
    },
    required: ['heading', 'description', 'cta'],
};

const designSchema = {
  type: Type.OBJECT,
  properties: {
    backgroundColor: { type: Type.STRING, description: 'A hex color code for the background (e.g., #FFFFFF).' },
    textColor: { type: Type.STRING, description: 'A hex color code for the text (e.g., #000000). Must have high contrast with backgroundColor.' },
    headingFont: { type: Type.STRING, description: 'A font name from the provided list for the heading.', enum: GOOGLE_FONTS },
    bodyFont: { type: Type.STRING, description: 'A font name from the provided list for the body text, that pairs well with headingFont.', enum: GOOGLE_FONTS },
    layoutStyle: { type: Type.STRING, description: 'The layout style for the poster.', enum: ['centered', 'left-aligned-image-right', 'image-top-text-bottom'] },
    imagePrompt: { type: Type.STRING, description: 'A creative, descriptive prompt for an AI image generator to create a background image related to the user input. E.g., "A minimalist abstract background with geometric shapes in pastel colors".' },
  },
  required: ['backgroundColor', 'textColor', 'headingFont', 'bodyFont', 'layoutStyle', 'imagePrompt'],
};

async function generateTextContent(prompt: string): Promise<GeneratedText> {
    const generationPrompt = `
      You are an expert social media copywriter. Based on the user's prompt, generate a compelling headline, description, and call-to-action for a social media post.
      The tone should be engaging and professional. Keep the text concise and impactful.
      Provide your output in a JSON format that strictly adheres to the provided schema.

      User Prompt: "${prompt}"

      Do not include any explanations, just the JSON object.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [{ text: generationPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: textSchema,
        },
    });

    const text = response.text.trim();
    try {
        const parsed = JSON.parse(text);
        return parsed as GeneratedText;
    } catch(e) {
        console.error("Failed to parse Gemini JSON response for text content:", text);
        throw new Error("AI failed to generate valid text content. Please try again.");
    }
}

async function generateDesign(generatedText: GeneratedText): Promise<DesignConcept> {
  const prompt = `
    You are a professional social media graphic designer. Your task is to create a design concept for a poster based on the provided text content.
    Provide your output in a JSON format that strictly adheres to the provided schema.

    Text Content:
    - Heading: "${generatedText.heading}"
    - Description: "${generatedText.description}"
    - Call to Action: "${generatedText.cta}"

    Your task is to generate a design concept that includes:
    1. A visually appealing and modern color palette (background and text colors). Ensure high contrast for readability.
    2. Suggestions for two Google Fonts that pair well together (one for the heading, one for the body) from this list: ${GOOGLE_FONTS.join(', ')}.
    3. A simple layout direction ('centered', 'left-aligned-image-right', or 'image-top-text-bottom').
    4. A highly specific and descriptive prompt for an AI image generator. This prompt MUST create a background image that is visually stunning and directly represents the core message of the text content and heading. Avoid generic or abstract descriptions like "abstract background". Focus on concrete, photorealistic, or high-quality illustrative imagery that reinforces the heading: "${generatedText.heading}". For example, if the heading is "Revolutionize Your Workflow with AI", a good prompt would be "A photorealistic image of a sleek, futuristic robot arm interacting with a holographic interface, with glowing data streams in the background, symbolizing efficiency and advanced technology."

    Do not include any explanations, just the JSON object.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: designSchema,
    },
  });
  
  const text = response.text.trim();
  try {
    const parsed = JSON.parse(text);
    return parsed as DesignConcept;
  } catch(e) {
    console.error("Failed to parse Gemini JSON response:", text);
    throw new Error("AI failed to generate a valid design. Please try again.");
  }
}

async function generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
        },
    });

    const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;
    
    if (base64ImageBytes) {
        return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error('Image generation failed. The AI could not create an image for the given prompt.');
}


export async function generateDesignAndImage(userInput: UserInput, userImage: string | null) {
  const generatedText = await generateTextContent(userInput.prompt);
  const design = await generateDesign(generatedText);
  
  let image: string;
  if(userImage) {
    image = userImage;
  } else {
    image = await generateImage(design.imagePrompt);
  }

  return { design, image, generatedText };
}
