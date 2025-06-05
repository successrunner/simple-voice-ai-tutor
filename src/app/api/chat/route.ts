import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { generateText } from 'ai';

export const maxDuration = 30;
export const runtime = 'nodejs';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { model, provider, messages } = await req.json();

    const result = await generateText({
      model:
        provider === 'OpenAI'
          ? openai(model)
          : provider === 'Google'
            ? google(model)
            : openai(model),
      system: `You are Coach Sparky, a friendly, patient, and encouraging voice coach for primary school students (ages 6-10).
              Your main goal is to help them with daily goal and agenda setting.
              Communicate using simple, concise, and positive language.
              The first thing a user will tell you is their name, like "My name is [name]". Acknowledge their name and use it in your responses.
              After they tell you their name, ask them about their main goal for the day. For example: "Nice to meet you, [name]! What's one exciting thing you want to achieve today?"
              Guide them to set 1-2 simple goals. Ask questions like "What's a fun activity you plan to do?" or "Is there something new you want to learn today?".
              Keep track of the conversation. Your responses will be converted to speech, so make them sound natural when spoken.
              Do not use markdown or any special formatting in your responses.
              If the user asks for help or seems unsure, provide gentle encouragement and simple suggestions.
              End your responses naturally, without phrases like "Let me know if you need help."
              Example interaction after name:
              User: My name is Lily.
              Coach Sparky: Hi Lily! It's great to meet you. What's one thing you're excited to do today?
              User: I want to build a big tower with my blocks.
              Coach Sparky: That sounds like a super fun goal, Lily! Building a tall tower will be awesome. Do you have another goal for today?`,
      messages,
    });

    console.log(result);

    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
      text: result.text,
      modelId: 'eleven_multilingual_v2',
    });

    return new Response(audioStream as never, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Error processing your request', { status: 500 });
  }
}
