# Card Vault - PRD

## Problem Statement
App/site para acessar tabela do Supabase com cartões de funcionários. Visualização animada de cartões de crédito com efeito flip - frente mostra número e validade, verso mostra CVV. Design cyberpunk/futurista.

## Architecture
- **Backend**: FastAPI + Supabase REST API
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Database**: Supabase PostgreSQL (table: credit_card_transactions)

## User Personas
- Gestores/administradores que precisam visualizar cartões corporativos dos funcionários

## Core Requirements
- [x] Conexão com Supabase
- [x] Listagem de cartões em tabela
- [x] Cartão 3D com animação flip
- [x] Visualização de CVV no verso
- [x] Design cyberpunk com neons
- [x] Responsividade mobile

## What's Been Implemented (Jan 2026)
1. Backend API com Supabase REST client
2. Dashboard com estatísticas (total cartões, funcionários únicos)
3. Tabela de cartões com números mascarados
4. Modal com cartão 3D animado
5. Flip animation (frente/verso)
6. Design cyberpunk completo (neon cyan/pink, glass morphism)

## Prioritized Backlog
### P0 (Done)
- Visualização de cartões ✅
- Flip animation ✅

### P1 (Next)
- Adicionar/Editar cartões (requer ajuste na tabela Supabase)
- Busca/filtro por nome

### P2 (Future)
- Exportar dados
- Histórico de transações
- Notificações de expiração

## Known Issues
- POST /api/cards falha porque tabela requer campo `order_id` não fornecido pela API

## Next Tasks
1. Ajustar schema da tabela ou API para permitir criação de cartões
2. Adicionar funcionalidade de busca/filtro
3. Implementar autenticação se necessário
