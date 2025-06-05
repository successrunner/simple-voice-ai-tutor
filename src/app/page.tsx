'use client';

import { useChat } from '@ai-sdk/react';
import { Mic, Play, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import ModelSelector from '@/components/model-selector';
import { Button } from '@/components/ui/button';
import { AVAILABLE_PROVIDERS } from '@/constants/models';
import { Model } from '@/types/model.type';

// Speech Recognition Types
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResults {
  [index: number]: {
    [index: number]: SpeechRecognitionResult;
    isFinal: boolean;
    length: number;
  };
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResults;
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

const STARTUP_SOUND =
  'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export default function Home() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [start, setStart] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(AVAILABLE_PROVIDERS[0].models[0]);
  const [openModelSelector, setOpenModelSelector] = useState(false);

  const { input, isLoading, setInput, handleSubmit } = useChat({
    body: {
      model: selectedModel.id,
      provider: selectedModel.provider,
    },
    onResponse: handleAIResponse,
  });

  async function handleAIResponse(response: Response) {
    stopListening();
    const audioBlob = await response.blob();
    const audioElement = createAudioElement(audioBlob);
    audioElement.onended = resumeListening;
    await playAudioWithFallback(audioElement);
  }

  function createAudioElement(blob: Blob) {
    return new Audio(URL.createObjectURL(blob));
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript(null);
  }

  function resumeListening() {
    recognitionRef.current?.start();
    setIsListening(true);
    setIsSpeaking(false);
  }

  async function playAudioWithFallback(audioElement: HTMLAudioElement) {
    try {
      setIsSpeaking(true);
      await audioElement.play();
    } catch (error) {
      console.error(
        'Audio playback failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      resumeListening();
    }
  }

  function initializeSpeechRecognition() {
    if (typeof window === 'undefined' || recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];

      if (results.length && lastResult.isFinal) {
        setTranscript(lastResult[0].transcript);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }

  function startConversation() {
    setStart(true);
    new Audio(STARTUP_SOUND).play();
    recognitionRef.current?.start();
    setIsListening(true);
  }

  useEffect(() => {
    initializeSpeechRecognition();
  }, []);

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
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
        <div className="fixed top-4 left-4">
          <ModelSelector
            open={openModelSelector}
            selectedModel={selectedModel}
            onOpenChange={setOpenModelSelector}
            handleModelSelect={setSelectedModel}
          />
        </div>
        <div className="flex justify-center">
          {!start ? (
            <Button
              size="icon"
              className="size-16 cursor-pointer rounded-full bg-white shadow-lg hover:bg-gray-100"
              onClick={startConversation}
            >
              <Play className="size-8 text-blue-500" />
            </Button>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              ) : isListening ? (
                <Mic className="h-8 w-8 text-blue-500" />
              ) : (
                <Volume2 className="h-8 w-8 animate-pulse text-green-500" />
              )}
            </div>
          )}
        </div>

        <div className="flex min-h-[100px] items-center justify-center rounded-lg bg-white p-6 shadow-lg">
          {!start ? (
            <p className="my-auto text-center text-lg text-gray-800">
              Click the play button to start the conversation
            </p>
          ) : isLoading ? (
            <p className="text-center text-lg text-gray-800">AI is thinking...</p>
          ) : isSpeaking ? (
            <p className="text-center text-lg text-gray-800">AI is speaking...</p>
          ) : (
            <p className="text-center text-lg text-gray-500">Listening...</p>
          )}
        </div>
      </div>
    </div>
  );
}
