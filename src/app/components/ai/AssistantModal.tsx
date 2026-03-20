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

  // Capture screen context as text - UNIVERSAL para TODAS las páginas de la app
  const captureScreenContext = (): string => {
    const context: string[] = [];
    const path = window.location.pathname;

    // ========== INFORMACIÓN BÁSICA (todas las páginas) ==========
    context.push(`Ubicación: ${path}`);
    context.push(`Título: ${document.title}`);

    const mainHeading = document.querySelector('h1');
    if (mainHeading?.textContent?.trim()) {
      context.push(`\nPágina: ${mainHeading.textContent.trim()}`);
    }

    const subtitle = document.querySelector('h1 + p');
    if (subtitle?.textContent?.trim()) {
      context.push(`Subtítulo: ${subtitle.textContent.trim()}`);
    }

    // ========== TABS/FILTROS ACTIVOS ==========
    const activeTabs = Array.from(
      document.querySelectorAll('[class*="bg-[#155dfc]"], [class*="bg-[#2b7fff]"], button[class*="shadow"]')
    )
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0 && text.length < 50);

    if (activeTabs.length > 0) {
      context.push(`\nTabs/Filtros activos: ${[...new Set(activeTabs)].join(', ')}`);
    }

    // ========== CATEGORÍAS/CHIPS ==========
    const chips = Array.from(document.querySelectorAll('[class*="rounded-full"]'))
      .map(chip => chip.textContent?.trim())
      .filter(text => text && text.length > 0 && text.length < 40);

    if (chips.length > 3) {
      context.push(`Categorías: ${[...new Set(chips)].join(', ')}`);
    }

    // ========== BÚSQUEDA ACTIVA ==========
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput?.value?.trim()) {
      context.push(`Búsqueda: "${searchInput.value}"`);
    }

    // ========== DETECTAR Y CAPTURAR CONTENIDO ESPECÍFICO POR TIPO ==========

    // 1. LISTAS (página /lists o cards de listas)
    const listCards = Array.from(document.querySelectorAll('a[href^="/lists/"]'));
    if (listCards.length > 0) {
      context.push(`\n\n========== LISTAS (${listCards.length}) ==========`);
      listCards.forEach((card, idx) => {
        const title = card.querySelector('h3')?.textContent?.trim() || 'Sin título';
        const badges = Array.from(card.querySelectorAll('span[class*="font-bold"]'))
          .map(b => b.textContent?.trim()).filter(Boolean);
        const category = card.querySelector('span[class*="text-[#51a2ff]"]')?.textContent?.trim();
        const author = card.textContent?.match(/por\s+(.+?)(?=\d|\s*$)/)?.[1]?.trim();
        const description = card.querySelector('p[class*="line-clamp"]')?.textContent?.trim();
        const likes = card.textContent?.match(/(\d+)/)?.[1];
        const games = card.textContent?.match(/(\d+)\s*juegos?/i)?.[1];

        context.push(`\n${idx + 1}. ${title}`);
        if (badges.length > 0) context.push(`   Badges: ${badges.join(', ')}`);
        if (category) context.push(`   Categoría: ${category}`);
        if (author) context.push(`   Autor: ${author}`);
        if (description) context.push(`   Descripción: ${description}`);
        if (likes || games) context.push(`   Stats: ${likes ? `${likes} likes` : ''} ${games ? `${games} juegos` : ''}`.trim());
      });
      context.push(`========== FIN LISTAS ==========\n`);
    }

    // 2. DETALLE DE LISTA (página /lists/:id)
    if (path.includes('/lists/') && !path.endsWith('/lists')) {
      const listTitle = document.querySelector('h1, h2')?.textContent?.trim();
      const listDesc = document.querySelector('p[class*="text-"]')?.textContent?.trim();
      const gameItems = Array.from(document.querySelectorAll('[class*="game"], li, [class*="item"]'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 5 && text.length < 200);

      if (listTitle) {
        context.push(`\n\n========== DETALLE DE LISTA ==========`);
        context.push(`Título: ${listTitle}`);
        if (listDesc) context.push(`Descripción: ${listDesc}`);
        if (gameItems.length > 0) {
          context.push(`\nJuegos en la lista (${gameItems.length}):`);
          gameItems.forEach((game, idx) => context.push(`${idx + 1}. ${game}`));
        }
        context.push(`========== FIN DETALLE ==========\n`);
      }
    }

    // 3. AMIGOS (página /friends)
    if (path.includes('/friends')) {
      const friendElements = Array.from(document.querySelectorAll('[class*="friend"], [class*="player"], [class*="user"]'));
      if (friendElements.length > 0) {
        context.push(`\n\n========== AMIGOS (${friendElements.length}) ==========`);
        friendElements.slice(0, 50).forEach((friend, idx) => {
          const name = friend.querySelector('[class*="name"], h3, h4')?.textContent?.trim();
          const status = friend.querySelector('[class*="status"], [class*="online"]')?.textContent?.trim();
          const game = friend.querySelector('[class*="game"]')?.textContent?.trim();

          if (name) {
            let line = `${idx + 1}. ${name}`;
            if (status) line += ` - ${status}`;
            if (game) line += ` (jugando: ${game})`;
            context.push(line);
          }
        });
        context.push(`========== FIN AMIGOS ==========\n`);
      }
    }

    // 4. PERFIL (página /profile)
    if (path.includes('/profile')) {
      const userName = document.querySelector('[class*="persona"], h1, h2')?.textContent?.trim();
      const stats = Array.from(document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="count"]'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length < 100);

      if (userName || stats.length > 0) {
        context.push(`\n\n========== PERFIL ==========`);
        if (userName) context.push(`Usuario: ${userName}`);
        if (stats.length > 0) {
          context.push(`\nEstadísticas:`);
          stats.forEach(stat => context.push(`- ${stat}`));
        }
        context.push(`========== FIN PERFIL ==========\n`);
      }
    }

    // 5. JUEGOS (grid de juegos en cualquier página)
    const gameCards = Array.from(document.querySelectorAll('[href^="/game/"], [class*="game-card"], [class*="game-item"]'));
    if (gameCards.length > 0 && listCards.length === 0) {
      context.push(`\n\n========== JUEGOS (${gameCards.length}) ==========`);
      gameCards.slice(0, 30).forEach((card, idx) => {
        const name = card.querySelector('h2, h3, h4, [alt]')?.textContent?.trim() ||
                     card.querySelector('img')?.getAttribute('alt');
        const price = card.querySelector('[class*="price"]')?.textContent?.trim();
        const discount = card.querySelector('[class*="discount"], [class*="sale"]')?.textContent?.trim();
        const tags = Array.from(card.querySelectorAll('[class*="tag"], [class*="genre"]'))
          .map(t => t.textContent?.trim()).filter(Boolean);

        if (name) {
          let line = `${idx + 1}. ${name}`;
          if (discount) line += ` ${discount}`;
          if (price) line += ` - ${price}`;
          if (tags.length > 0) line += ` [${tags.join(', ')}]`;
          context.push(line);
        }
      });
      context.push(`========== FIN JUEGOS ==========\n`);
    }

    // 6. MERCADO/OFERTAS (página /market)
    if (path.includes('/market')) {
      const offerCards = Array.from(document.querySelectorAll('[class*="offer"], [class*="deal"], [class*="sale"]'));
      if (offerCards.length > 0) {
        context.push(`\n\n========== OFERTAS (${offerCards.length}) ==========`);
        offerCards.slice(0, 20).forEach((card, idx) => {
          const offer = card.textContent?.trim();
          if (offer && offer.length < 200) {
            context.push(`${idx + 1}. ${offer}`);
          }
        });
        context.push(`========== FIN OFERTAS ==========\n`);
      }
    }

    // 7. HOME (página principal)
    if (path === '/' || path === '/home') {
      const sections = Array.from(document.querySelectorAll('section, [class*="section"], [class*="carousel"]'));
      if (sections.length > 0) {
        context.push(`\n\n========== HOME - SECCIONES ==========`);
        sections.slice(0, 10).forEach((section, idx) => {
          const heading = section.querySelector('h1, h2, h3')?.textContent?.trim();
          const items = Array.from(section.querySelectorAll('[class*="card"], [class*="item"]'))
            .map(item => item.textContent?.trim().slice(0, 100))
            .filter(Boolean)
            .slice(0, 5);

          if (heading) {
            context.push(`\n${idx + 1}. ${heading}`);
            if (items.length > 0) {
              items.forEach(item => context.push(`   - ${item}`));
            }
          }
        });
        context.push(`========== FIN HOME ==========\n`);
      }
    }

    // 8. TABLA/LEADERBOARD (admin, stats, etc.)
    const tables = Array.from(document.querySelectorAll('table, [role="table"]'));
    if (tables.length > 0) {
      context.push(`\n\n========== TABLAS/DATOS ==========`);
      tables.forEach((table, idx) => {
        const headers = Array.from(table.querySelectorAll('th'))
          .map(th => th.textContent?.trim()).filter(Boolean);
        const rows = Array.from(table.querySelectorAll('tbody tr')).slice(0, 20);

        if (headers.length > 0) {
          context.push(`\nTabla ${idx + 1}: ${headers.join(' | ')}`);
          rows.forEach((row, rowIdx) => {
            const cells = Array.from(row.querySelectorAll('td'))
              .map(td => td.textContent?.trim()).filter(Boolean);
            if (cells.length > 0) {
              context.push(`${rowIdx + 1}. ${cells.join(' | ')}`);
            }
          });
        }
      });
      context.push(`========== FIN TABLAS ==========\n`);
    }

    // 9. BOTONES/ACCIONES IMPORTANTES
    const actionButtons = Array.from(
      document.querySelectorAll('button[class*="bg-[#009966]"], button[class*="bg-[#155dfc]"], [class*="btn-primary"]')
    )
      .map(btn => btn.textContent?.trim())
      .filter(text => text && text.length < 50);

    if (actionButtons.length > 0) {
      context.push(`\nAcciones: ${[...new Set(actionButtons)].join(', ')}`);
    }

    // 10. CONTENIDO GENÉRICO (fallback si nada específico fue capturado)
    if (context.length < 8) {
      const mainContent = document.querySelector('main, [role="main"], #root > div > div');
      if (mainContent?.textContent?.trim()) {
        const allText = mainContent.textContent.trim();
        context.push(`\n\n========== TODO EL CONTENIDO ==========\n${allText}\n========== FIN ==========`);
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
