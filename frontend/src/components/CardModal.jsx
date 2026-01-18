import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Copy, Check, CreditCard as CardIcon, Building, Globe, Tag } from 'lucide-react';
import CreditCard3D from './CreditCard3D';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CardModal = ({ card, isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [binInfo, setBinInfo] = useState(null);
  const [loadingBin, setLoadingBin] = useState(false);

  useEffect(() => {
    if (card?.card_number && isOpen) {
      fetchBinInfo(card.card_number);
    }
    return () => {
      setBinInfo(null);
      setIsFlipped(false);
    };
  }, [card, isOpen]);

  const fetchBinInfo = async (cardNumber) => {
    setLoadingBin(true);
    try {
      const bin = cardNumber.replace(/\s/g, '').slice(0, 6);
      const response = await axios.get(`${API}/bin/${bin}`);
      setBinInfo(response.data);
    } catch (error) {
      console.error('Error fetching BIN:', error);
    } finally {
      setLoadingBin(false);
    }
  };

  const handleClose = () => {
    setIsFlipped(false);
    setCopiedField(null);
    setBinInfo(null);
    onClose();
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado!', { description: `${field} copiado para a área de transferência` });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  const CopyButton = ({ text, field, className = '' }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(text, field);
      }}
      className={`p-1.5 rounded hover:bg-white/10 transition-colors ${className}`}
      data-testid={`copy-${field}`}
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-white/50 hover:text-neon-cyan" />
      )}
    </button>
  );

  const formatExpiry = () => {
    if (!card) return '';
    return `${card.expiry_month}/${card.expiry_year?.slice(-2) || card.expiry_year}`;
  };

  const copyAll = () => {
    if (!card) return;
    const fullData = `${card.card_number}|${card.expiry_month}|${card.expiry_year}|${card.cvv}|${card.cardholder_name}`;
    copyToClipboard(fullData, 'Todos os dados');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="bg-cyber-gray/95 border border-neon-cyan/30 backdrop-blur-xl max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto"
        data-testid="card-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-orbitron text-neon-cyan text-lg md:text-xl tracking-widest uppercase text-center">
            {card?.cardholder_name || 'Cartão'}
          </DialogTitle>
          <DialogDescription className="text-white/40 text-center text-xs md:text-sm font-mono">
            Clique no cartão ou botão para ver o verso
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 md:py-6">
          <CreditCard3D 
            card={card} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)} 
          />
        </div>

        {/* BIN Info */}
        {binInfo && (binInfo.scheme || binInfo.bank || binInfo.country) && (
          <div className="bg-cyber-surface/50 rounded-lg p-3 md:p-4 border border-white/10 mb-4" data-testid="bin-info">
            <p className="text-xs text-neon-pink font-orbitron uppercase tracking-widest mb-2">Informações da BIN</p>
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
              {binInfo.scheme && (
                <div className="flex items-center gap-2">
                  <CardIcon className="w-3 h-3 md:w-4 md:h-4 text-neon-cyan" />
                  <span className="text-white/70">Bandeira:</span>
                  <span className="text-white uppercase">{binInfo.scheme}</span>
                </div>
              )}
              {binInfo.type && (
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 md:w-4 md:h-4 text-neon-cyan" />
                  <span className="text-white/70">Tipo:</span>
                  <span className="text-white capitalize">{binInfo.type}</span>
                </div>
              )}
              {binInfo.bank && (
                <div className="flex items-center gap-2 col-span-2">
                  <Building className="w-3 h-3 md:w-4 md:h-4 text-neon-cyan" />
                  <span className="text-white/70">Banco:</span>
                  <span className="text-white truncate">{binInfo.bank}</span>
                </div>
              )}
              {binInfo.country && (
                <div className="flex items-center gap-2 col-span-2">
                  <Globe className="w-3 h-3 md:w-4 md:h-4 text-neon-cyan" />
                  <span className="text-white/70">País:</span>
                  <span className="text-white">{binInfo.country_emoji} {binInfo.country}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Copy buttons */}
        <div className="space-y-2 mb-4">
          <p className="text-xs text-neon-cyan font-orbitron uppercase tracking-widest">Copiar Dados</p>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2 border border-white/10">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/40 block">Número</span>
                <span className="text-white font-mono text-xs md:text-sm truncate block">{card?.card_number}</span>
              </div>
              <CopyButton text={card?.card_number} field="numero" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2 border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 block">Validade</span>
                  <span className="text-white font-mono text-xs md:text-sm">{formatExpiry()}</span>
                </div>
                <CopyButton text={formatExpiry()} field="validade" />
              </div>
              
              <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2 border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 block">CVV</span>
                  <span className="text-white font-mono text-xs md:text-sm">{card?.cvv}</span>
                </div>
                <CopyButton text={card?.cvv} field="cvv" />
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2 border border-white/10">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/40 block">Titular</span>
                <span className="text-white font-mono text-xs md:text-sm truncate block">{card?.cardholder_name}</span>
              </div>
              <CopyButton text={card?.cardholder_name} field="titular" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 pb-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn-cyber px-4 md:px-6 py-2 border border-neon-cyan text-neon-cyan font-orbitron text-xs uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all duration-300 rounded"
            data-testid="flip-card-btn"
          >
            {isFlipped ? 'Ver Frente' : 'Ver CVV'}
          </button>
          
          <button
            onClick={copyAll}
            className="btn-cyber px-4 md:px-6 py-2 border border-neon-pink text-neon-pink font-orbitron text-xs uppercase tracking-widest hover:bg-neon-pink hover:text-black transition-all duration-300 rounded flex items-center justify-center gap-2"
            data-testid="copy-all-btn"
          >
            <Copy className="w-4 h-4" />
            Copiar Tudo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;
