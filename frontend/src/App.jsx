import { useEffect, useState, useCallback } from "react";
import "./App.css";
import axios from "axios";
import { CreditCard, Database, RefreshCw, Trash2, CheckCircle, XCircle, Bell, BellOff, Download, Filter, X } from "lucide-react";
import CardTable from "./components/CardTable";
import CardModal from "./components/CardModal";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Skull ASCII art variations
const SKULL_FRAMES = ["Cards", "C4rd5", "☠", "💀", "C@rd$", "SKULL", "D34D", "Cards"];

// Local storage helpers
const getLocalStatus = (cardId) => {
  try {
    const stored = localStorage.getItem(`card_status_${cardId}`);
    return stored ? JSON.parse(stored) : { is_live: null, tested_at: '' };
  } catch {
    return { is_live: null, tested_at: '' };
  }
};

const getStoredCardCount = () => {
  try {
    return parseInt(localStorage.getItem('los_cards_count') || '0');
  } catch {
    return 0;
  }
};

const setStoredCardCount = (count) => {
  try {
    localStorage.setItem('los_cards_count', count.toString());
  } catch (e) {
    console.error('Error saving card count:', e);
  }
};

// Animated Background Component
const AnimatedBackground = () => (
  <div className="animated-bg">
    <div className="orb orb-1"></div>
    <div className="orb orb-2"></div>
    <div className="orb orb-3"></div>
    <div className="orb orb-4"></div>
  </div>
);

// Mini 3D Card Component
const Mini3DCard = () => (
  <div className="mini-card-container">
    <div className="mini-card">
      <div className="mini-card-face mini-card-front">
        <div className="w-3 h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-sm"></div>
      </div>
      <div className="mini-card-face mini-card-back">
        <div className="w-full h-1 bg-gray-800 mt-1"></div>
      </div>
    </div>
  </div>
);

// Animated Logo Component
const AnimatedLogo = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % SKULL_FRAMES.length);
        setIsGlitching(false);
      }, 150);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <Mini3DCard />
      <div>
        <h1 className="font-orbitron text-base md:text-xl text-white tracking-wider uppercase flex items-center gap-1">
          Los{" "}
          <span 
            className={`text-neon-cyan text-glow-cyan skull-text ${isGlitching ? 'glitch-text' : ''}`}
            data-text={SKULL_FRAMES[textIndex]}
          >
            {SKULL_FRAMES[textIndex]}
          </span>
        </h1>
        <p className="text-[10px] text-white/40 font-mono">Painel CCS</p>
      </div>
    </div>
  );
};

// Install PWA Button Component
const InstallButton = ({ onInstall, canInstall }) => {
  if (!canInstall) return null;
  
  return (
    <button
      onClick={onInstall}
      className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-orbitron text-[10px] uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all rounded"
      data-testid="install-btn"
    >
      <Download className="w-3 h-3" />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
};

// Filter Component
const FilterButtons = ({ filter, setFilter }) => (
  <div className="flex items-center gap-1 bg-cyber-surface/50 rounded-lg p-1 border border-white/10">
    <button
      onClick={() => setFilter('all')}
      className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
        filter === 'all' ? 'bg-neon-cyan text-black' : 'text-white/60 hover:text-white'
      }`}
      data-testid="filter-all"
    >
      Todos
    </button>
    <button
      onClick={() => setFilter('live')}
      className={`px-2 py-1 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
        filter === 'live' ? 'bg-green-500 text-black' : 'text-white/60 hover:text-green-400'
      }`}
      data-testid="filter-live"
    >
      <CheckCircle className="w-3 h-3" /> Live
    </button>
    <button
      onClick={() => setFilter('die')}
      className={`px-2 py-1 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
        filter === 'die' ? 'bg-red-500 text-black' : 'text-white/60 hover:text-red-400'
      }`}
      data-testid="filter-die"
    >
      <XCircle className="w-3 h-3" /> Die
    </button>
    <button
      onClick={() => setFilter('untested')}
      className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
        filter === 'untested' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
      }`}
      data-testid="filter-untested"
    >
      ?
    </button>
  </div>
);

function App() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Handle PWA install
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App instalado!', { description: 'Los Cards foi adicionado à tela inicial' });
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  // Request notification permission
  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(false);
      toast.info('Notificações desativadas');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Notificações ativadas!', { description: 'Você será notificado quando novos cartões aparecerem' });
      
      // Show test notification
      new Notification('Los Cards', {
        body: 'Notificações ativadas com sucesso! ☠',
        icon: '/icons/icon-192.png'
      });
    } else {
      toast.error('Permissão negada para notificações');
    }
  };

  // Show notification for new cards
  const showNewCardNotification = useCallback((newCount, oldCount) => {
    if (!notificationsEnabled || newCount <= oldCount) return;
    
    const diff = newCount - oldCount;
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Los Cards - Novo Cartão! 💳', {
        body: `${diff} novo(s) cartão(ões) adicionado(s)!`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200]
      });
    }
  }, [notificationsEnabled]);

  const fetchCards = useCallback(async (showNotification = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/cards`);
      const cardsWithStatus = response.data.map(card => {
        const localStatus = getLocalStatus(card.id);
        return {
          ...card,
          is_live: card.is_live ?? localStatus.is_live,
          tested_at: card.tested_at || localStatus.tested_at
        };
      });
      
      // Check for new cards
      if (showNotification) {
        const oldCount = getStoredCardCount();
        if (cardsWithStatus.length > oldCount) {
          showNewCardNotification(cardsWithStatus.length, oldCount);
        }
      }
      
      setStoredCardCount(cardsWithStatus.length);
      setCards(cardsWithStatus);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Erro ao carregar cartões");
    } finally {
      setIsLoading(false);
    }
  }, [showNewCardNotification]);

  useEffect(() => {
    fetchCards(false);
    
    // Poll for new cards every 30 seconds if notifications are enabled
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        fetchCards(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCards, notificationsEnabled]);

  const handleViewCard = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleStatusUpdate = (cardId, status) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, ...status } : card
      )
    );
  };

  const removeDuplicates = async () => {
    setRemovingDuplicates(true);
    try {
      const response = await axios.delete(`${API}/cards/duplicates`);
      toast.success(response.data.message);
      fetchCards(false);
    } catch (error) {
      console.error("Error removing duplicates:", error);
      toast.error("Erro ao remover duplicados");
    } finally {
      setRemovingDuplicates(false);
    }
  };

  // Filter cards
  const filteredCards = cards.filter(card => {
    if (filter === 'all') return true;
    if (filter === 'live') return card.is_live === true;
    if (filter === 'die') return card.is_live === false;
    if (filter === 'untested') return card.is_live === null || card.is_live === undefined;
    return true;
  });

  // Calculate stats
  const totalCards = cards.length;
  const uniqueBicos = new Set(cards.map(c => c.cardholder_name)).size;
  const liveCards = cards.filter(c => c.is_live === true).length;
  const dieCards = cards.filter(c => c.is_live === false).length;
  const duplicateCount = totalCards - new Set(cards.map(c => c.card_number?.replace(/\s/g, ''))).size;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="scanlines" />
      
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#0a0a0f',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: '#e0e0e0'
          }
        }}
      />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-cyber-gray/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <AnimatedLogo />
            
            <div className="flex items-center gap-2">
              {/* Install Button */}
              <InstallButton onInstall={handleInstall} canInstall={canInstall} />
              
              {/* Notification Toggle */}
              <button
                onClick={toggleNotifications}
                className={`p-2 border rounded transition-all ${
                  notificationsEnabled 
                    ? 'border-neon-yellow bg-neon-yellow/20 text-neon-yellow' 
                    : 'border-white/30 text-white/50 hover:text-white'
                }`}
                data-testid="notification-btn"
                title={notificationsEnabled ? 'Notificações ativadas' : 'Ativar notificações'}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              
              {/* Database Status */}
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-cyber-surface/50 border border-white/10">
                <Database className="w-3 h-3 text-neon-pink" />
                <span className="text-[10px] font-mono text-white/60">Supabase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              
              {/* Refresh */}
              <button
                onClick={() => fetchCards(false)}
                disabled={isLoading}
                className="p-2 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all rounded disabled:opacity-50 bg-cyber-black/50"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="glass rounded-lg p-3 md:p-4 border-l-2 border-neon-cyan">
            <p className="text-[9px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest mb-1">Total</p>
            <p className="text-xl md:text-2xl font-orbitron text-neon-cyan text-glow-cyan" data-testid="total-cards">
              {totalCards}
            </p>
          </div>
          <div className="glass rounded-lg p-3 md:p-4 border-l-2 border-neon-pink">
            <p className="text-[9px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest mb-1">Bicos</p>
            <p className="text-xl md:text-2xl font-orbitron text-neon-pink text-glow-pink">
              {uniqueBicos}
            </p>
          </div>
          <div className="glass rounded-lg p-3 md:p-4 border-l-2 border-green-500">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <p className="text-[9px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest">Live</p>
            </div>
            <p className="text-xl md:text-2xl font-orbitron text-green-400">
              {liveCards}
            </p>
          </div>
          <div className="glass rounded-lg p-3 md:p-4 border-l-2 border-red-500">
            <div className="flex items-center gap-1 mb-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <p className="text-[9px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest">Die</p>
            </div>
            <p className="text-xl md:text-2xl font-orbitron text-red-400">
              {dieCards}
            </p>
          </div>
        </div>

        {/* Cards Table */}
        <div className="glass rounded-xl p-4 md:p-6">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-orbitron text-sm md:text-base text-white uppercase tracking-wider">
                  Cartões dos <span className="text-neon-cyan">Bicos</span>
                </h2>
                <span className="text-[10px] font-mono text-white/40">
                  {filteredCards.length} de {totalCards} registro(s)
                </span>
              </div>
              
              {duplicateCount > 0 && (
                <button
                  onClick={removeDuplicates}
                  disabled={removingDuplicates}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 font-orbitron text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded disabled:opacity-50"
                  data-testid="remove-duplicates-btn"
                >
                  <Trash2 className="w-4 h-4" />
                  {removingDuplicates ? 'Removendo...' : `Remover ${duplicateCount} Duplicado(s)`}
                </button>
              )}
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              <FilterButtons filter={filter} setFilter={setFilter} />
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="p-1 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <CardTable 
            cards={filteredCards} 
            onViewCard={handleViewCard}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Card Modal */}
      <CardModal 
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 mt-6 relative z-10 bg-cyber-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-[10px] text-white/30 font-mono">
            LOS CARDS // PAINEL CCS // v2.1 // ☠ // PWA
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
