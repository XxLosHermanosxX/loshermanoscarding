import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { X } from 'lucide-react';
import CreditCard3D from './CreditCard3D';

const CardModal = ({ card, isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClose = () => {
    setIsFlipped(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="bg-cyber-gray/95 border border-neon-cyan/30 backdrop-blur-xl max-w-lg w-full"
        data-testid="card-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-orbitron text-neon-cyan text-xl tracking-widest uppercase text-center">
            {card?.cardholder_name || 'Cartão'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-8">
          <CreditCard3D 
            card={card} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)} 
          />
        </div>
        
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn-cyber px-6 py-2 border border-neon-cyan text-neon-cyan font-orbitron text-sm uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all duration-300 rounded"
            data-testid="flip-card-btn"
          >
            {isFlipped ? 'Ver Frente' : 'Ver CVV'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;
