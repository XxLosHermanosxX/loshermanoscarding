import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Copy, Check, CreditCard as CardIcon, Building, Globe, Tag, CheckCircle, XCircle, Save } from 'lucide-react';
import CreditCard3D from './CreditCard3D';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Local storage helper for card status (until Supabase columns are added)
const getLocalStatus = (cardId) => {
  try {
    const stored = localStorage.getItem(`card_status_${cardId}`);
    return stored ? JSON.parse(stored) : { is_live: null, tested_at: '' };
  } catch {
    return { is_live: null, tested_at: '' };
  }
};

const setLocalStatus = (cardId, status) => {
  try {
    localStorage.setItem(`card_status_${cardId}`, JSON.stringify(status));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

const CardModal = ({ card, isOpen, onClose, onStatusUpdate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [binInfo, setBinInfo] = useState(null);
  const [loadingBin, setLoadingBin] = useState(false);
  const [isLive, setIsLive] = useState(null);
  const [testedAt, setTestedAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (card && isOpen) {
      // Try to get from card first, then from localStorage
      const localStatus = getLocalStatus(card.id);
      setIsLive(card.is_live ?? localStatus.is_live ?? null);
      setTestedAt(card.tested_at || localStatus.tested_at || '');
      
      if (card.card_number) {
        fetchBinInfo(card.card_number);
      }
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
    if (!text) {
      toast.error('Nada para copiar');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado!', { description: `${field} copiado` });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      // Fallback for mobile
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedField(field);
        toast.success('Copiado!', { description: `${field} copiado` });
        setTimeout(() => setCopiedField(null), 2000);
      } catch (e) {
        toast.error('Erro ao copiar');
      }
      document.body.removeChild(textArea);
    }
  };

  const CopyButton = ({ text, field, className = '' }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(text, field);
      }}
      className={`p-2 rounded hover:bg-white/10 transition-colors active:scale-95 ${className}`}
      data-testid={`copy-${field}`}
    >
      {copiedField === field ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <Copy className="w-5 h-5 text-white/50 hover:text-neon-cyan" />
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

  const saveStatus = async () => {
    if (!card) return;
    setSaving(true);
    
    const statusData = { is_live: isLive, tested_at: testedAt };
    
    try {
      // Try to save to Supabase first
      await axios.patch(`${API}/cards/${card.id}/status`, statusData);
      toast.success('Status salvo no servidor!');
    } catch (error) {
      // If Supabase fails (columns don't exist), save locally
      console.log('Saving locally (Supabase columns not found)');
      setLocalStatus(card.id, statusData);
      toast.success('Status salvo localmente!', { 
        description: 'Adicione as colunas is_live e tested_at no Supabase para salvar no servidor' 
      });
    }
    
    // Update parent component
    if (onStatusUpdate) {
      onStatusUpdate(card.id, statusData);
    }
    
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="bg-cyber-gray/95 border border-neon-cyan/30 backdrop-blur-xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 md:p-6"
        data-testid="card-modal"
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="font-orbitron text-neon-cyan text-base md:text-xl tracking-widest uppercase text-center">
            {card?.cardholder_name || 'Cartão'}
          </DialogTitle>
          <DialogDescription className="text-white/40 text-center text-xs font-mono">
            Toque no cartão para ver o verso
          </DialogDescription>
        </DialogHeader>
        
        {/* 3D Card */}
        <div className="py-3 md:py-4">
          <CreditCard3D 
            card={card} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)} 
          />
        </div>

        {/* Live Status */}
        <div className="bg-cyber-surface/50 rounded-lg p-3 border border-white/10 mb-3" data-testid="status-section">
          <p className="text-xs text-neon-yellow font-orbitron uppercase tracking-widest mb-2">Status do Cartão</p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setIsLive(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded border transition-all active:scale-95 ${
                isLive === true 
                  ? 'bg-green-500/20 border-green-500 text-green-400' 
                  : 'border-white/20 text-white/50 hover:border-green-500/50'
              }`}
              data-testid="live-btn"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-mono">LIVE</span>
            </button>
            <button
              onClick={() => setIsLive(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded border transition-all active:scale-95 ${
                isLive === false 
                  ? 'bg-red-500/20 border-red-500 text-red-400' 
                  : 'border-white/20 text-white/50 hover:border-red-500/50'
              }`}
              data-testid="die-btn"
            >
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-mono">DIE</span>
            </button>
          </div>
          <div>
            <label className="text-[10px] text-white/40 block mb-1">Onde foi testado</label>
            <input
              type="text"
              value={testedAt}
              onChange={(e) => setTestedAt(e.target.value)}
              placeholder="Ex: Amazon, Netflix, Spotify..."
              className="w-full bg-cyber-black/50 border border-white/20 rounded px-3 py-2.5 text-sm text-white font-mono placeholder:text-white/30 focus:border-neon-cyan focus:outline-none"
              data-testid="tested-at-input"
            />
          </div>
          <button
            onClick={saveStatus}
            disabled={saving}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-neon-yellow/20 border border-neon-yellow text-neon-yellow font-orbitron text-xs uppercase tracking-widest hover:bg-neon-yellow hover:text-black transition-all rounded disabled:opacity-50 active:scale-[0.98]"
            data-testid="save-status-btn"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Status'}
          </button>
        </div>

        {/* BIN Info */}
        {binInfo && (binInfo.scheme || binInfo.bank || binInfo.country) && (
          <div className="bg-cyber-surface/50 rounded-lg p-3 border border-white/10 mb-3" data-testid="bin-info">
            <p className="text-xs text-neon-pink font-orbitron uppercase tracking-widest mb-2">Info da BIN</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {binInfo.scheme && (
                <div className="flex items-center gap-1.5">
                  <CardIcon className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                  <span className="text-white/70">Bandeira:</span>
                  <span className="text-white uppercase">{binInfo.scheme}</span>
                </div>
              )}
              {binInfo.type && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                  <span className="text-white/70">Tipo:</span>
                  <span className="text-white capitalize">{binInfo.type}</span>
                </div>
              )}
              {binInfo.bank && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <Building className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                  <span className="text-white/70">Banco:</span>
                  <span className="text-white truncate">{binInfo.bank}</span>
                </div>
              )}
              {binInfo.country && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <Globe className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                  <span className="text-white/70">País:</span>
                  <span className="text-white">{binInfo.country_emoji} {binInfo.country}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Copy Section */}
        <div className="space-y-2 mb-3">
          <p className="text-xs text-neon-cyan font-orbitron uppercase tracking-widest">Copiar Dados</p>
          
          <div className="space-y-2">
            {/* Card Number */}
            <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2.5 border border-white/10">
              <div className="flex-1 min-w-0 mr-2">
                <span className="text-[10px] text-white/40 block">Número</span>
                <span className="text-white font-mono text-sm truncate block">{card?.card_number}</span>
              </div>
              <CopyButton text={card?.card_number} field="numero" />
            </div>
            
            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2.5 border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 block">Validade</span>
                  <span className="text-white font-mono text-sm">{formatExpiry()}</span>
                </div>
                <CopyButton text={formatExpiry()} field="validade" />
              </div>
              
              <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2.5 border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 block">CVV</span>
                  <span className="text-white font-mono text-sm">{card?.cvv}</span>
                </div>
                <CopyButton text={card?.cvv} field="cvv" />
              </div>
            </div>
            
            {/* Cardholder */}
            <div className="flex items-center justify-between bg-cyber-surface/50 rounded px-3 py-2.5 border border-white/10">
              <div className="flex-1 min-w-0 mr-2">
                <span className="text-[10px] text-white/40 block">Titular</span>
                <span className="text-white font-mono text-sm truncate block">{card?.cardholder_name}</span>
              </div>
              <CopyButton text={card?.cardholder_name} field="titular" />
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pb-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn-cyber py-2.5 border border-neon-cyan text-neon-cyan font-orbitron text-xs uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all rounded active:scale-[0.98]"
            data-testid="flip-card-btn"
          >
            {isFlipped ? 'Ver Frente' : 'Ver CVV'}
          </button>
          
          <button
            onClick={copyAll}
            className="btn-cyber py-2.5 border border-neon-pink text-neon-pink font-orbitron text-xs uppercase tracking-widest hover:bg-neon-pink hover:text-black transition-all rounded flex items-center justify-center gap-2 active:scale-[0.98]"
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
