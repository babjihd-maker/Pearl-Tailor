'use client';
import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function SingleVoiceInput({ onResult }: { onResult: (val: string) => void }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

 useEffect(() => {
    // @ts-ignore
    if (typeof window !== 'undefined' && !window.webkitSpeechRecognition && !(window as any).SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!supported) return alert("Voice not supported in this browser.");
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      // Extract the first number found in the speech (e.g., "Size is 40" -> "40")
      const number = text.match(/(\d+(\.\d+)?)/); 
      if (number) {
        onResult(number[0]);
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    
    recognition.start();
  };

  if (!supported) return null;

  return (
    <button 
      onClick={startListening}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        listening 
          ? 'bg-red-100 text-red-500 animate-pulse shadow-sm' 
          : 'text-slate-400 hover:text-[#E91E63] hover:bg-pink-50'
      }`}
      type="button"
      title="Tap to speak number"
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}