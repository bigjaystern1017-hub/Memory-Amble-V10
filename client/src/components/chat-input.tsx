import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function ChatInput({ onSend, placeholder = "Type your answer...", disabled, autoFocus = true }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, placeholder]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2.5" data-testid="chat-input-container">
      {speechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          data-testid="button-microphone"
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          className="flex items-center justify-center w-14 h-14 rounded-xl border transition-all duration-150 shrink-0"
          style={
            isListening
              ? { backgroundColor: "#6D2DE2", borderColor: "#6D2DE2", color: "#fff" }
              : { backgroundColor: "#F5F3FF", borderColor: "#DDD8F5", color: "#6D2DE2" }
          }
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      )}

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : placeholder}
        disabled={disabled}
        data-testid="input-chat"
        className="flex-1 h-14 text-xl px-5 rounded-xl border bg-white outline-none transition-all duration-150"
        style={{
          borderColor: "#DDD8F5",
          color: "#1A1028",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6D2DE2")}
        onBlur={(e) => (e.target.style.borderColor = "#DDD8F5")}
      />

      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        data-testid="button-send"
        aria-label="Send message"
        className="flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-150 shrink-0 disabled:opacity-40"
        style={{ backgroundColor: "#6D2DE2", color: "#fff" }}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
