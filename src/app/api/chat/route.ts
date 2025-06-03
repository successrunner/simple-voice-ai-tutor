import { openai } from "@ai-sdk/openai";
import {
  experimental_generateSpeech as generateSpeech,
  generateText,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await generateText({
      model: openai("gpt-4"),
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

    const audio = await generateSpeech({
      model: openai.speech("tts-1"),
      text: result.text,
      voice: "alloy",
    });

    const audioBlob = new Blob([audio.audio.uint8Array], {
      type: "audio/mpeg",
    });

    // Convert audio blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    return new Response(
      JSON.stringify({
        text: result.text,
        audio: base64Audio,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response("Error processing your request", { status: 500 });
  }
}
