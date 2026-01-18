import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { CreditCard, Database, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react";
import CardTable from "./components/CardTable";
import CardModal from "./components/CardModal";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/cards`);
      setCards(response.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Erro ao carregar cartões");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

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
      fetchCards();
    } catch (error) {
      console.error("Error removing duplicates:", error);
      toast.error("Erro ao remover duplicados");
    } finally {
      setRemovingDuplicates(false);
    }
  };

  // Calculate stats
  const totalCards = cards.length;
  const uniqueBicos = new Set(cards.map(c => c.cardholder_name)).size;
  const liveCards = cards.filter(c => c.is_live === true).length;
  const dieCards = cards.filter(c => c.is_live === false).length;
  const duplicateCount = totalCards - new Set(cards.map(c => c.card_number?.replace(/\s/g, ''))).size;

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
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
      <header className="border-b border-white/10 bg-cyber-gray/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 flex items-center justify-center border border-neon-cyan/30 shadow-neon-cyan">
                <CreditCard className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h1 className="font-orbitron text-base md:text-xl text-white tracking-wider uppercase">
                  Los <span className="text-neon-cyan text-glow-cyan">Cards</span>
                </h1>
                <p className="text-[10px] text-white/40 font-mono">Painel CCS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded bg-cyber-surface border border-white/10">
                <Database className="w-3 h-3 text-neon-pink" />
                <span className="text-[10px] font-mono text-white/60">Supabase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
              
              <button
                onClick={fetchCards}
                disabled={isLoading}
                className="p-2 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all rounded disabled:opacity-50"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-orbitron text-sm md:text-base text-white uppercase tracking-wider">
                Cartões dos <span className="text-neon-cyan">Bicos</span>
              </h2>
              <span className="text-[10px] font-mono text-white/40">
                {totalCards} registro(s)
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
          
          <CardTable 
            cards={cards} 
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
      <footer className="border-t border-white/10 mt-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-[10px] text-white/30 font-mono">
            LOS CARDS // PAINEL CCS // v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
