import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API Route Handler for image generation
 * 
 * Endpoint: POST /api/generate-image
 * Request body: { prompt: string }
 * Response: { imageUrl: string } | { error: string }
 * 
 * This route handles:
 * - Validation of the incoming prompt
 * - Communication with Nebius API
 * - Error handling and response formatting
 */
export async function POST(req: Request) {
  try {
    // Extract prompt from request body
    const { prompt } = await req.json();

    // Validate prompt existence
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate image using Nebius API
    const response = await fetch('https://api.studio.nebius.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEBIUS_API_KEY}`
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux-dev",
        prompt: prompt,
        response_format: 'url',
        response_extension: 'webp',
        width: 1024,
        height: 1024,
        num_inference_steps: 28,
        negative_prompt: "",
        seed: -1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    console.log('Image Generated:', data);

    // Return the generated image URL
    return NextResponse.json({ imageUrl: data.data[0].url });
  } catch (error: any) {
    // Log error for debugging and return user-friendly error message
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}