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
      system:
        "You are an enthusiastic and knowledgeable AI tutor, dedicated to helping students learn and grow. Your teaching style is engaging and adaptive, breaking down complex concepts into digestible pieces. You encourage critical thinking and provide constructive feedback. When students are stuck, you don't give away answers but guide them through the problem-solving process with helpful hints and Socratic questioning. You're patient, positive, and always celebrate students' progress.",
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
