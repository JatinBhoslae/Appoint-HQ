import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/input';

const VoiceSearchBar = ({ onSearch, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        if (onSearch) {
          onSearch(text);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError('Error occurred in recognition: ' + event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Voice recognition not supported in this browser.');
    }
  }, [onSearch]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setTranscript('');
    }
  };

  const handleInputChange = (e) => {
    setTranscript(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Input
        icon={<Search className="h-5 w-5" />}
        value={transcript}
        onChange={handleInputChange}
        placeholder="Search services..."
        className="bg-white/50 backdrop-blur-sm border-border/50 focus:bg-background"
        rightElement={
          <motion.button
            onClick={toggleListening}
            className={cn(
              "p-2 rounded-full transition-colors flex items-center justify-center",
              isListening ? "text-red-500 bg-red-100" : "text-muted-foreground hover:bg-muted"
            )}
            title="Voice Search"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <Mic className="relative inline-flex h-5 w-5" />
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Mic className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        }
      />
      
      <AnimatePresence>
          {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-6 left-0 text-xs text-red-500"
              >
                {error}
              </motion.p>
          )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSearchBar;
