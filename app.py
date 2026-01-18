"""
Wrapper para iniciar o servidor FastAPI do backend
Este arquivo permite que o Railway execute o servidor sem problemas de diretórios
"""
import sys
import os
from pathlib import Path

# Adicionar o diretório backend ao path do Python
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Agora importar o app do server.py
from server import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
