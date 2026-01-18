import { Eye, CreditCard as CardIcon, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const CardTable = ({ cards, onViewCard, isLoading }) => {
  const maskCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    const last4 = cleaned.slice(-4);
    return '•••• •••• •••• ' + last4;
  };

  const getStatusIcon = (isLive) => {
    if (isLive === true) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (isLive === false) return <XCircle className="w-4 h-4 text-red-400" />;
    return <HelpCircle className="w-4 h-4 text-white/30" />;
  };

  const getStatusText = (isLive) => {
    if (isLive === true) return 'LIVE';
    if (isLive === false) return 'DIE';
    return '---';
  };

  const getStatusColor = (isLive) => {
    if (isLive === true) return 'text-green-400';
    if (isLive === false) return 'text-red-400';
    return 'text-white/30';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-neon-cyan font-mono text-sm">Carregando...</span>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <CardIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 font-mono text-sm">Nenhum cartão encontrado</p>
      </div>
    );
  }

  // Mobile card view
  const MobileCardItem = ({ card }) => (
    <div 
      className={`bg-cyber-gray border-l-2 transition-all duration-300 rounded-lg p-4 mb-3 ${
        card.is_live === true ? 'border-green-500' : 
        card.is_live === false ? 'border-red-500' : 'border-transparent hover:border-neon-cyan'
      }`}
      data-testid={`card-row-${card.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 flex items-center justify-center border border-white/10">
            <span className="font-orbitron text-sm text-neon-cyan">
              {card.cardholder_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <span className="font-mono text-white text-sm block">{card.cardholder_name}</span>
            <span className="font-mono text-white/50 text-xs">{maskCardNumber(card.card_number)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {getStatusIcon(card.is_live)}
          <span className={`text-xs font-mono ${getStatusColor(card.is_live)}`}>
            {getStatusText(card.is_live)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-white/50 text-xs">
          Validade: {card.expiry_month}/{card.expiry_year?.slice(-2) || card.expiry_year}
        </span>
        {card.tested_at && (
          <span className="text-xs text-neon-yellow font-mono truncate max-w-[120px]">
            📍 {card.tested_at}
          </span>
        )}
      </div>
      
      <button
        onClick={() => onViewCard(card)}
        className="btn-cyber w-full flex items-center justify-center gap-2 px-4 py-3 border border-neon-cyan text-neon-cyan font-orbitron text-xs uppercase tracking-widest hover:bg-neon-cyan hover:text-black active:scale-[0.98] transition-all duration-300 rounded"
        data-testid={`view-card-btn-${card.id}`}
      >
        <Eye className="w-4 h-4" />
        Ver Cartão
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden" data-testid="cards-mobile">
        {cards.map((card) => (
          <MobileCardItem key={card.id} card={card} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto" data-testid="cards-table">
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
                Bico
              </th>
              <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
                Número
              </th>
              <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
                Validade
              </th>
              <th className="text-center px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
                Status
              </th>
              <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
                Testado
              </th>
              <th className="text-center px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr 
                key={card.id} 
                className={`bg-cyber-gray border-l-2 transition-all duration-300 hover:translate-x-1 group ${
                  card.is_live === true ? 'border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 
                  card.is_live === false ? 'border-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                  'border-transparent hover:border-neon-cyan hover:shadow-neon-cyan'
                }`}
                data-testid={`card-row-${card.id}`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 flex items-center justify-center border border-white/10">
                      <span className="font-orbitron text-sm text-neon-cyan">
                        {card.cardholder_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="font-mono text-white group-hover:text-neon-cyan transition-colors">
                      {card.cardholder_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-white/70 tracking-wider">
                    {maskCardNumber(card.card_number)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-white/70">
                    {card.expiry_month}/{card.expiry_year?.slice(-2) || card.expiry_year}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {getStatusIcon(card.is_live)}
                    <span className={`text-xs font-mono ${getStatusColor(card.is_live)}`}>
                      {getStatusText(card.is_live)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-neon-yellow/70 text-sm truncate block max-w-[150px]">
                    {card.tested_at || '---'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onViewCard(card)}
                    className="btn-cyber inline-flex items-center gap-2 px-4 py-2 border border-neon-cyan text-neon-cyan font-orbitron text-xs uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all duration-300 rounded shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]"
                    data-testid={`view-card-btn-${card.id}`}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CardTable;
