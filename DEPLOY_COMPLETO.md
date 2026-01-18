# 🚀 Guia Completo de Deploy - Los Cards

## Arquitetura do Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub                                │
│         (Repositório do Código Fonte)                       │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
                      ▼                   ▼
          ┌───────────────────┐  ┌──────────────────┐
          │      Railway      │  │     Vercel       │
          │   (Backend API)   │  │   (Frontend)     │
          │   FastAPI Python  │  │   React SPA      │
          │   Port: $PORT     │  │   Static Build   │
          └─────────┬─────────┘  └────────┬─────────┘
                    │                     │
                    ▼                     │
          ┌───────────────────┐           │
          │     Supabase      │◄──────────┘
          │   (PostgreSQL)    │
          │   Já configurado  │
          └───────────────────┘
```

---

## 📋 Pré-requisitos

1. **Conta GitHub** - https://github.com
2. **Conta Railway** - https://railway.app (free tier disponível)
3. **Conta Vercel** - https://vercel.com (free tier disponível)
4. **Credenciais Supabase** (já configuradas):
   - `SUPABASE_URL`: https://inpjpmtjpfkkbqukpkhs.supabase.co
   - `SUPABASE_KEY`: Sua chave de service role

---

## 🔧 PARTE 1: Preparar o Projeto no GitHub

### Passo 1.1: Estrutura de Arquivos Necessária

Certifique-se que seu repositório tem estes arquivos na raiz:

```
loshermanoscarding/
├── app.py                    # ← Backend principal (para Railway)
├── Procfile                  # ← Comando de start
├── railway.json              # ← Configuração Railway
├── vercel.json               # ← Configuração Vercel
├── backend/
│   ├── server.py
│   └── requirements.txt      # ← Dependências Python
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
└── ...
```

### Passo 1.2: Push para GitHub (se ainda não fez)

```bash
# Clone o repositório (se necessário)
git clone https://github.com/XxLosHermanosxX/loshermanoscarding.git
cd loshermanoscarding

# Verifique o status
git status

# Se houver alterações, faça commit
git add .
git commit -m "Prepare for Railway + Vercel deployment"
git push origin main
```

---

## 🚂 PARTE 2: Deploy do Backend no Railway

### Passo 2.1: Criar Conta no Railway

1. Acesse https://railway.app
2. Clique em **"Start a New Project"**
3. Faça login com **GitHub**

### Passo 2.2: Importar Projeto do GitHub

1. No dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `loshermanoscarding`
4. Railway detectará automaticamente que é um projeto Python

### Passo 2.3: Configurar Variáveis de Ambiente

No Railway, vá em **Settings → Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://inpjpmtjpfkkbqukpkhs.supabase.co` |
| `SUPABASE_KEY` | `sua_chave_supabase_aqui` |
| `CORS_ORIGINS` | `*` (depois mude para a URL do Vercel) |
| `PORT` | `8001` (Railway define automaticamente) |

### Passo 2.4: Configurar Build

Railway usa `railway.json` automaticamente. Verifique se está assim:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Passo 2.5: Instalar Dependências

Railway instala do `requirements.txt` automaticamente. 
Certifique-se que `backend/requirements.txt` ou o `requirements.txt` na raiz tem:

```
fastapi==0.110.1
uvicorn==0.25.0
supabase==2.27.2
python-dotenv==1.2.1
httpx==0.28.1
pydantic==2.12.5
```

### Passo 2.6: Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Após concluir, clique em **"Settings"**
4. Vá em **"Networking"** → **"Generate Domain"**
5. Copie a URL gerada (ex: `https://loscards-production.up.railway.app`)

### Passo 2.7: Testar a API

```bash
# Substitua pela sua URL do Railway
curl https://SUA-URL-RAILWAY.up.railway.app/api/

# Deve retornar:
# {"message":"Los Cards - Painel CCS API"}

# Testar listagem de cartões
curl https://SUA-URL-RAILWAY.up.railway.app/api/cards
```

---

## ▲ PARTE 3: Deploy do Frontend no Vercel

### Passo 3.1: Criar Conta no Vercel

1. Acesse https://vercel.com
2. Clique em **"Sign Up"**
3. Conecte com sua conta **GitHub**

### Passo 3.2: Importar Projeto

1. No dashboard, clique em **"Add New" → "Project"**
2. Selecione o repositório `loshermanoscarding`
3. Clique em **"Import"**

### Passo 3.3: Configurar o Build

Configure assim:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `frontend` ← IMPORTANTE! |
| **Build Command** | `yarn build` |
| **Output Directory** | `build` |

### Passo 3.4: Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

| Nome | Valor |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://SUA-URL-RAILWAY.up.railway.app` |

⚠️ **IMPORTANTE**: Use a URL do Railway que você obteve no passo 2.6!

### Passo 3.5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Vercel vai gerar uma URL como: `https://loshermanoscarding.vercel.app`

### Passo 3.6: Testar o Frontend

1. Acesse a URL do Vercel
2. Verifique se os cartões estão carregando
3. Teste a animação 3D clicando em um cartão

---

## 🔒 PARTE 4: Configurar CORS (Importante!)

Após ter ambos os deploys funcionando:

### Passo 4.1: Atualizar CORS no Railway

1. Vá ao projeto Railway
2. **Settings → Variables**
3. Atualize `CORS_ORIGINS`:

```
CORS_ORIGINS=https://loshermanoscarding.vercel.app,https://loshermanoscarding-*.vercel.app
```

Isso permite o Vercel acessar sua API.

### Passo 4.2: Re-deploy

Após mudar as variáveis, Railway faz redeploy automático.

---

## ✅ PARTE 5: Verificação Final

### Checklist de Funcionamento

- [ ] Backend Railway responde em `/api/`
- [ ] Endpoint `/api/cards` retorna dados do Supabase
- [ ] Frontend Vercel carrega sem erros
- [ ] Cartões aparecem na interface
- [ ] Animação 3D funciona ao clicar
- [ ] Copiar dados funciona
- [ ] Mobile responsive funciona

### URLs Finais (exemplo)

| Serviço | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://loshermanoscarding.vercel.app` |
| **Backend (Railway)** | `https://loscards-production.up.railway.app` |
| **API Docs** | `https://loscards-production.up.railway.app/docs` |

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch" no Frontend

**Causa**: CORS não configurado ou URL do backend errada.

**Solução**:
1. Verifique `REACT_APP_BACKEND_URL` no Vercel
2. Verifique `CORS_ORIGINS` no Railway
3. Re-deploy ambos

### Erro: "Connection refused" no Railway

**Causa**: Porta incorreta.

**Solução**: 
Certifique-se que o comando usa `$PORT`:
```
uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Erro: Build failed no Vercel

**Causa**: Root directory errado ou dependências faltando.

**Solução**:
1. Confirme que Root Directory é `frontend`
2. Delete `node_modules` e `yarn.lock`, depois redeploy
3. Verifique erros no log de build

### Erro: Supabase connection failed

**Causa**: Variáveis de ambiente não definidas.

**Solução**:
1. Verifique `SUPABASE_URL` e `SUPABASE_KEY` no Railway
2. Confirme que não há espaços extras
3. Teste localmente primeiro

---

## 📱 Configuração PWA (Opcional)

O frontend já está configurado como PWA. Para funcionar no deploy:

1. O arquivo `sw.js` já está em `public/`
2. Manifesto já configurado
3. Após deploy no Vercel, usuários podem "Instalar App"

---

## 🔄 Atualizações Futuras

Após configurar CI/CD:

1. **Faça push para `main`** no GitHub
2. **Railway** faz redeploy automático do backend
3. **Vercel** faz redeploy automático do frontend

Tempo médio de deploy: ~2-3 minutos.

---

## 💰 Custos

| Serviço | Plano | Limite Free |
|---------|-------|-------------|
| **Railway** | Free | $5/mês em créditos, ~500 horas |
| **Vercel** | Hobby | Ilimitado para projetos pessoais |
| **Supabase** | Free | 500MB storage, 2GB transfer |

Para uso pessoal, o free tier é suficiente!

---

## 📞 Suporte

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**🎉 Parabéns! Seu Los Cards está no ar!**
