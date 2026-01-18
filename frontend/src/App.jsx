import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { CreditCard, Database, RefreshCw } from "lucide-react";
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

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/cards`);
      setCards(response.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Erro ao carregar cartões", {
        description: "Verifique a conexão com o banco de dados"
      });
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

  return (
    <div className="min-h-screen bg-cyber-black scanlines">
      <Toaster 
        position="top-right" 
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 flex items-center justify-center border border-neon-cyan/30 shadow-neon-cyan">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-neon-cyan" />
              </div>
              <div>
                <h1 className="font-orbitron text-base md:text-2xl text-white tracking-wider md:tracking-widest uppercase">
                  Los <span className="text-neon-cyan text-glow-cyan">Cards</span>
                </h1>
                <p className="text-[10px] md:text-xs text-white/40 font-mono tracking-wider">
                  Painel CCS
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-cyber-surface border border-white/10">
                <Database className="w-4 h-4 text-neon-pink" />
                <span className="text-xs font-mono text-white/60">Supabase</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              
              <button
                onClick={fetchCards}
                disabled={isLoading}
                className="btn-cyber p-2 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all duration-300 rounded disabled:opacity-50"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="glass rounded-xl p-4 md:p-6 border-l-2 border-neon-cyan">
            <p className="text-[10px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest mb-1 md:mb-2">Total de Cartões</p>
            <p className="text-2xl md:text-3xl font-orbitron text-neon-cyan text-glow-cyan" data-testid="total-cards">
              {cards.length}
            </p>
          </div>
          <div className="glass rounded-xl p-4 md:p-6 border-l-2 border-neon-pink">
            <p className="text-[10px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest mb-1 md:mb-2">Bicos</p>
            <p className="text-2xl md:text-3xl font-orbitron text-neon-pink text-glow-pink">
              {new Set(cards.map(c => c.cardholder_name)).size}
            </p>
          </div>
          <div className="glass rounded-xl p-4 md:p-6 border-l-2 border-neon-yellow col-span-2 md:col-span-1">
            <p className="text-[10px] md:text-xs text-white/50 font-orbitron uppercase tracking-widest mb-1 md:mb-2">Status</p>
            <p className="text-lg md:text-xl font-orbitron text-neon-yellow">
              {isLoading ? 'Sincronizando...' : 'Online'}
            </p>
          </div>
        </div>

        {/* Cards Table */}
        <div className="glass rounded-xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="font-orbitron text-sm md:text-lg text-white uppercase tracking-wider md:tracking-widest">
              Cartões dos <span className="text-neon-cyan">Bicos</span>
            </h2>
            <span className="text-[10px] md:text-xs font-mono text-white/40">
              {cards.length} registro(s)
            </span>
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
      />

      {/* Footer */}
      <footer className="border-t border-white/10 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <p className="text-center text-[10px] md:text-xs text-white/30 font-mono">
            LOS CARDS // PAINEL CCS // v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
