"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Mic, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function Home() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [start, setStart] = useState(false);
  const [aiCaption, setAiCaption] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const { input, isLoading, setInput, handleSubmit } = useChat({
    onResponse: async (response) => {
      const { text, audio } = await response.json();
      handleAIResponse(text, audio);
    },
  });

  const handleAIResponse = (text: string, audio: string) => {
    // Stop listening while AI is talking
    stopListening();

    const audioElement = createAudioElement(audio);
    setAiCaption(text);

    audioElement.onended = resumeListening;
    playAudioWithFallback(audioElement);
  };

  const createAudioElement = (audioData: string) => {
    const audioBlob = new Blob([Buffer.from(audioData, "base64")], {
      type: "audio/mpeg",
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    return new Audio(audioUrl);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript(null);
  };

  const resumeListening = () => {
    recognitionRef.current?.start();
    setIsListening(true);
    setAiCaption(null);
  };

  const playAudioWithFallback = async (audioElement: HTMLAudioElement) => {
    try {
      await audioElement.play();
    } catch (error) {
      console.error(
        "Audio playback failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
      resumeListening();
    }
  };

  const initializeSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || recognitionRef.current) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      if (results.length && results[results.length - 1].isFinal) {
        setTranscript(results[results.length - 1][0].transcript);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current?.start();
      }
    };
  };

  const startConversation = () => {
    setStart(true);
    new Audio(
      "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
    ).play();
    recognitionRef.current?.start();
    setIsListening(true);
  };

  useEffect(initializeSpeechRecognition, []);

  useEffect(() => {
    if (input) {
      handleSubmit();
      recognitionRef.current?.stop();
    }
  }, [input, handleSubmit]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript, setInput]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="relative w-full max-w-2xl mx-auto p-4">
        <div className="flex justify-center mb-8">
          {!start ? (
            <Button
              size="icon"
              className="size-16 rounded-full bg-white hover:bg-gray-100 shadow-lg cursor-pointer"
              onClick={startConversation}
            >
              <Play className="size-8 text-blue-500" />
            </Button>
          ) : (
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : isListening ? (
                <Mic className="w-8 h-8 text-blue-500" />
              ) : (
                <Volume2 className="w-8 h-8 text-green-500 animate-pulse" />
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 min-h-[100px] flex items-center justify-center">
          {!start ? (
            <p className="text-gray-800 text-lg text-center my-auto">
              Click the play button to start the conversation
            </p>
          ) : isLoading ? (
            <p className="text-gray-800 text-lg text-center">
              AI is thinking...
            </p>
          ) : aiCaption ? (
            <p className="text-gray-800 text-lg text-center">{aiCaption}</p>
          ) : (
            <p className="text-gray-500 text-lg text-center">Listening...</p>
          )}
        </div>
      </div>
    </div>
  );
}
