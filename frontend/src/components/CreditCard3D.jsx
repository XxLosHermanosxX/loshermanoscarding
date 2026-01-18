import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, CreditCard as CardIcon } from 'lucide-react';

const CreditCard3D = ({ card, isFlipped, onFlip }) => {
  const formatCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || number;
  };

  const maskCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    const last4 = cleaned.slice(-4);
    const masked = '•••• •••• •••• ' + last4;
    return masked;
  };

  return (
    <div 
      className="perspective-1000 w-full max-w-[400px] cursor-pointer mx-auto"
      onClick={onFlip}
      data-testid="credit-card-3d"
    >
      <motion.div
        className="relative w-full transform-style-3d"
        style={{ aspectRatio: '1.586' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-white/20 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Hologram effect */}
            <div className="absolute inset-0 hologram opacity-30 pointer-events-none" />
            
            {/* Top row */}
            <div className="flex justify-between items-start relative z-10">
              {/* Chip */}
              <div className="card-chip w-12 h-9 rounded-md shadow-lg" />
              
              {/* Contactless + Logo */}
              <div className="flex items-center gap-3">
                <Wifi className="w-6 h-6 text-white/70 rotate-90" />
                <CardIcon className="w-8 h-8 text-neon-cyan" />
              </div>
            </div>
            
            {/* Card Number */}
            <div className="relative z-10">
              <p className="font-mono text-xl md:text-2xl tracking-[0.2em] text-white">
                {formatCardNumber(card?.card_number)}
              </p>
            </div>
            
            {/* Bottom row */}
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Card Holder</p>
                <p className="font-orbitron text-sm md:text-base text-white uppercase tracking-wider">
                  {card?.cardholder_name || 'NOME DO TITULAR'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Expires</p>
                <p className="font-mono text-sm md:text-base text-white">
                  {card?.expiry_month || 'MM'}/{card?.expiry_year?.slice(-2) || 'YY'}
                </p>
              </div>
            </div>
            
            {/* Decorative lines */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-yellow opacity-50" />
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden rotate-y-180"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-neon-pink/50 rounded-2xl flex flex-col justify-between shadow-neon-pink relative overflow-hidden">
            {/* Magnetic stripe */}
            <div className="magnetic-stripe w-full h-12 mt-6" />
            
            {/* Signature strip and CVV */}
            <div className="px-6 flex items-center gap-4">
              <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end pr-4">
                <span className="font-mono text-gray-800 italic text-sm">
                  {card?.cardholder_name || 'Assinatura'}
                </span>
              </div>
              <div className="cvv-box px-4 py-2 rounded">
                <p className="font-mono text-lg text-gray-900 font-bold tracking-widest" data-testid="cvv-display">
                  {card?.cvv || '•••'}
                </p>
              </div>
            </div>
            
            {/* Bottom info */}
            <div className="px-6 pb-6">
              <p className="text-[10px] text-white/50 leading-relaxed">
                Este cartão é propriedade do emissor e deve ser devolvido mediante solicitação.
                O uso está sujeito aos termos do contrato do titular do cartão.
              </p>
              <div className="flex justify-between items-center mt-3">
                <CardIcon className="w-6 h-6 text-neon-pink" />
                <p className="text-xs text-white/50 font-mono">CYBER BANK</p>
              </div>
            </div>
            
            {/* Decorative line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan opacity-50" />
          </div>
        </div>
      </motion.div>
      
      {/* Hint text */}
      <p className="text-center text-xs text-white/40 mt-4 font-mono">
        {isFlipped ? 'Clique para ver a frente' : 'Clique para ver o CVV'}
      </p>
    </div>
  );
};

export default CreditCard3D;
