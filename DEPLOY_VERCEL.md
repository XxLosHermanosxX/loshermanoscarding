# Deploy na Vercel - Passo a Passo

## 1. Preparar o Projeto para GitHub

### Backend (FastAPI) - NÃO vai para Vercel
A Vercel não suporta Python/FastAPI nativamente. Você tem 2 opções:
- **Opção A**: Usar Vercel Serverless Functions (requer reescrever o backend)
- **Opção B**: Fazer deploy do backend em outro serviço (Railway, Render, Fly.io)

### Frontend (React) - PODE ir para Vercel

## 2. Push para GitHub

```bash
# No terminal local, navegue até a pasta do projeto
cd /caminho/do/projeto

# Inicialize o git (se ainda não tiver)
git init

# Adicione os arquivos
git add .

# Faça o commit
git commit -m "Los Cards - Painel CCS"

# Adicione o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/los-cards.git

# Push para o GitHub
git push -u origin main
```

## 3. Deploy do Frontend na Vercel

### Passo 1: Criar conta na Vercel
1. Acesse https://vercel.com
2. Clique em "Sign Up"
3. Conecte com sua conta GitHub

### Passo 2: Importar Projeto
1. No dashboard da Vercel, clique em "Add New" → "Project"
2. Selecione o repositório `los-cards` do GitHub
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (IMPORTANTE!)
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`

### Passo 3: Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:
```
REACT_APP_BACKEND_URL=https://SUA_URL_DO_BACKEND
```

⚠️ IMPORTANTE: Você precisa ter o backend rodando em algum lugar para a Vercel funcionar!

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Sua URL será algo como: `https://los-cards.vercel.app`

## 4. Deploy do Backend (Opções)

### Opção A: Railway (Recomendado)
1. Acesse https://railway.app
2. Conecte com GitHub
3. Selecione o repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Adicione variáveis de ambiente:
   ```
   SUPABASE_URL=https://inpjpmtjpfkkbqukpkhs.supabase.co
   SUPABASE_KEY=sua_chave
   CORS_ORIGINS=https://los-cards.vercel.app
   ```

### Opção B: Render
1. Acesse https://render.com
2. Crie um "Web Service"
3. Conecte ao GitHub
4. Configure igual ao Railway

## 5. Atualizar URL no Vercel

Depois do backend estar online:
1. Vá ao dashboard da Vercel
2. Settings → Environment Variables
3. Atualize `REACT_APP_BACKEND_URL` com a URL do Railway/Render
4. Redeploy o projeto

## Resumo
1. GitHub ← Push do código
2. Vercel ← Frontend React
3. Railway/Render ← Backend FastAPI
4. Supabase ← Banco de dados (já está online)

## Adicionar Colunas no Supabase (IMPORTANTE!)

Para o status LIVE/DIE funcionar no servidor:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "Table Editor" → "credit_card_transactions"
4. Clique em "Add column" e adicione:
   - `is_live` - tipo `bool` - nullable ✓
   - `tested_at` - tipo `text` - nullable ✓
5. Salve as alterações

Enquanto as colunas não existirem, o status é salvo localmente no navegador.
