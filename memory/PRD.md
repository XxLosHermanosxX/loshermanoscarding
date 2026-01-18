# Los Cards - Painel CCS - PRD

## Problem Statement
App para acessar tabela do Supabase com cartões dos Bicos (funcionários). Visualização animada de cartões com flip effect. Design cyberpunk. Opções de copiar dados e identificação de BIN.

## Architecture
- **Backend**: FastAPI + Supabase REST API + binlist.net (BIN lookup)
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Database**: Supabase PostgreSQL (table: credit_card_transactions)

## User Personas
- Gestores que precisam visualizar/copiar dados de cartões dos Bicos

## Core Requirements
- [x] Conexão com Supabase
- [x] Listagem de cartões (desktop: tabela, mobile: cards)
- [x] Cartão 3D com animação flip
- [x] Visualização de CVV no verso
- [x] Identificação de BIN (bandeira, tipo, banco, país)
- [x] Opções de copiar dados
- [x] Design cyberpunk com neons
- [x] Responsividade mobile completa

## What's Been Implemented (Jan 2026)

### Fase 1 - MVP
- Backend API com Supabase REST client
- Dashboard com estatísticas
- Tabela de cartões com números mascarados
- Modal com cartão 3D animado
- Flip animation (frente/verso)
- Design cyberpunk

### Fase 2 - Melhorias
- Nome alterado para "Los Cards - Painel CCS"
- "Funcionários" → "Bicos"
- API BIN lookup via binlist.net (/api/bin/{bin})
- Modal exibe: Bandeira, Tipo, Banco, País (com emoji)
- Botões de copiar: Número, Validade, CVV, Titular
- Botão "Copiar Tudo" (formato: número|mes|ano|cvv|nome)
- Layout mobile responsivo (cards individuais)
- Toast de confirmação ao copiar

## Prioritized Backlog
### P0 (Done)
- Visualização de cartões ✅
- Flip animation ✅
- Copiar dados ✅
- BIN lookup ✅
- Mobile responsivo ✅

### P1 (Next)
- Busca/filtro por nome ou número
- Adicionar/Editar cartões (requer ajuste na tabela Supabase)

### P2 (Future)
- Exportar dados (CSV/Excel)
- Histórico de uso
- Notificações de expiração

## Known Issues
- POST /api/cards falha porque tabela requer campo `order_id` não fornecido

## Next Tasks
1. Implementar busca/filtro
2. Ajustar schema para permitir criação de cartões
