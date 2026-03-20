import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Send, Sparkles, Eye } from "lucide-react";
import api from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  hasScreenContext?: boolean;
}

// FUTURO: Descomentar cuando tengamos modelo de visión de Groq
/*
import { Monitor, Image as ImageIcon, XCircle } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
}
*/

export function AssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: '¡Hola! Soy tu asistente de juegos SteaMate. Puedo analizar tu biblioteca, sugerir ofertas o recomendarte joyas ocultas. Usa el botón 👁️ para compartir el contexto de lo que estás viendo. ¿En qué te ayudo?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasScreenContext, setHasScreenContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // FUTURO: Descomentar cuando tengamos modelo de visión
  // const [attachedImage, setAttachedImage] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, loading]);

  // Capture screen context as text
  const captureScreenContext = (): string => {
    const context: string[] = [];

    // 1. Current page/route
    const path = window.location.pathname;
    context.push(`Página actual: ${path}`);

    // 2. Page title
    const pageTitle = document.title;
    if (pageTitle) {
      context.push(`Título de página: ${pageTitle}`);
    }

    // 3. Main headings visible (h1, h2)
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .slice(0, 10)
      .map(h => h.textContent?.trim())
      .filter(Boolean);
    if (headings.length > 0) {
      context.push(`\nEncabezados visibles:\n${headings.map(h => `- ${h}`).join('\n')}`);
    }

    // 4. Game titles visible (common class names in gaming apps)
    const gameElements = Array.from(
      document.querySelectorAll('[class*="game"], [class*="title"], [data-game-name]')
    )
      .slice(0, 15)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 3 && text.length < 100);

    if (gameElements.length > 0) {
      const uniqueGames = [...new Set(gameElements)];
      context.push(`\nJuegos/Elementos visibles:\n${uniqueGames.slice(0, 10).map(g => `- ${g}`).join('\n')}`);
    }

    // 5. Any text content from main area (limited sample)
    const mainContent = document.querySelector('main, [role="main"], .content');
    if (mainContent) {
      const text = mainContent.textContent?.slice(0, 500).trim();
      if (text && text.length > 50) {
        context.push(`\nContenido principal (muestra): ${text.slice(0, 300)}...`);
      }
    }

    return context.join('\n');
  };

  const handleToggleScreenContext = () => {
    setHasScreenContext(!hasScreenContext);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const screenContext = hasScreenContext ? captureScreenContext() : null;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      hasScreenContext: !!screenContext
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post('/api/chat/message', {
        message: userText,
        sessionId,
        userId: user?.steamid || 'anonymous',
        steamId: user?.steamid,
        screenContext: screenContext || undefined,
      });

      const data = response.data;
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.response || 'Lo siento, no pude generar una respuesta.',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Lo siento, tuve un problema al procesar tu solicitud. Intenta de nuevo más tarde."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setHasScreenContext(false); // Reset after sending
    }
  };

  // FUTURO: Descomentar cuando tengamos modelo de visión
  /*
  // Capture screen/window/tab
  const handleCaptureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      // Capture frame to canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/png');
      setAttachedImage(dataUrl);
    } catch (error) {
      console.error('Screen capture error:', error);
      // User probably cancelled the permission dialog
    }
  };

  // Attach image from file
  const handleAttachImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || loading) return;

    const userText = input.trim() || '¿Qué ves en esta imagen?';
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      image: attachedImage || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    const imageToSend = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const response = await api.post('/api/chat/message', {
        message: userText,
        sessionId,
        userId: user?.steamid || 'anonymous',
        steamId: user?.steamid,
        image: imageToSend,
      });

      const data = response.data;
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.response || 'Lo siento, no pude generar una respuesta.',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Lo siento, tuve un problema al procesar tu solicitud. Intenta de nuevo más tarde."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110 group"
      >
        <Bot size={28} className="group-hover:animate-bounce" />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-slate-900"></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-20 right-6 md:bottom-28 md:right-10 w-[90vw] md:w-[400px] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">SteaMate AI</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-900/20'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 shadow-sm'
                        }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                          <Bot size={12} /> SteaMate AI
                        </div>
                      )}
                      {msg.hasScreenContext && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-cyan-400">
                          <Eye size={12} />
                          <span>Con contexto de pantalla</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-900 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  {/* Screen context toggle button */}
                  <button
                    onClick={handleToggleScreenContext}
                    disabled={loading}
                    className={`transition-all disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg ${
                      hasScreenContext
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                    }`}
                    title={hasScreenContext ? "Contexto de pantalla activado" : "Dar contexto de pantalla"}
                  >
                    <Eye size={20} />
                  </button>

                  {/* Input field */}
                  <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 focus-within:border-blue-500 transition-colors">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={hasScreenContext ? "Pregunta sobre lo que ves en pantalla..." : "Pídeme una recomendación..."}
                      className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      className="text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
                {hasScreenContext && (
                  <div className="mt-2 text-xs text-cyan-400 flex items-center gap-1">
                    <Eye size={12} />
                    <span>Se incluirá el contexto de lo que estás viendo en pantalla</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
