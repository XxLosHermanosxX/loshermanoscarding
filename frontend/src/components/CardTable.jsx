import { Eye, CreditCard as CardIcon } from 'lucide-react';

const CardTable = ({ cards, onViewCard, isLoading }) => {
  const maskCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    const last4 = cleaned.slice(-4);
    return '•••• •••• •••• ' + last4;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
        <span className="ml-4 text-neon-cyan font-mono">Carregando dados...</span>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-20" data-testid="empty-state">
        <CardIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 font-mono">Nenhum cartão encontrado</p>
        <p className="text-white/30 text-sm mt-2">Os cartões aparecerão aqui quando disponíveis</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="cards-table">
      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
        <thead>
          <tr>
            <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
              Titular
            </th>
            <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
              Número do Cartão
            </th>
            <th className="text-left px-4 py-3 text-neon-cyan font-orbitron uppercase text-xs tracking-[0.2em]">
              Validade
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
              className="bg-cyber-gray border-l-2 border-transparent hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan hover:translate-x-1 group"
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
                <button
                  onClick={() => onViewCard(card)}
                  className="btn-cyber inline-flex items-center gap-2 px-4 py-2 border border-neon-cyan text-neon-cyan font-orbitron text-xs uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all duration-300 rounded shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]"
                  data-testid={`view-card-btn-${card.id}`}
                >
                  <Eye className="w-4 h-4" />
                  Ver Cartão
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardTable;
