from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
env_path = ROOT_DIR / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    # Se não existir .env, carregar do ambiente
    load_dotenv()

# Supabase client
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic schemas
class CardBase(BaseModel):
    card_number: str
    expiry_month: str
    expiry_year: str
    cvv: str
    cardholder_name: str

class CardResponse(CardBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    is_live: Optional[bool] = None
    tested_at: Optional[str] = None

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    card_number: Optional[str] = None
    expiry_month: Optional[str] = None
    expiry_year: Optional[str] = None
    cvv: Optional[str] = None
    cardholder_name: Optional[str] = None
    is_live: Optional[bool] = None
    tested_at: Optional[str] = None

class CardStatusUpdate(BaseModel):
    is_live: Optional[bool] = None
    tested_at: Optional[str] = None

class BinInfo(BaseModel):
    scheme: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    country: Optional[str] = None
    country_emoji: Optional[str] = None
    bank: Optional[str] = None
    prepaid: Optional[bool] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Los Cards - Painel CCS API"}

@api_router.get("/cards", response_model=List[CardResponse])
async def get_cards():
    try:
        response = supabase.table('credit_card_transactions').select('*').order('id', desc=True).execute()
        return response.data
    except Exception as e:
        logging.error(f"Error fetching cards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cards/{card_id}", response_model=CardResponse)
async def get_card(card_id: str):
    try:
        response = supabase.table('credit_card_transactions').select('*').eq('id', card_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching card {card_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/cards/{card_id}/status", response_model=CardResponse)
async def update_card_status(card_id: str, status: CardStatusUpdate):
    """Update card live status and tested_at field"""
    try:
        update_data = status.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table('credit_card_transactions').update(update_data).eq('id', card_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating card status {card_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cards/duplicates")
async def remove_duplicates():
    """Remove duplicate cards based on card_number"""
    try:
        # Get all cards
        response = supabase.table('credit_card_transactions').select('*').execute()
        cards = response.data
        
        if not cards:
            return {"message": "No cards found", "removed": 0}
        
        # Find duplicates (keep first occurrence)
        seen = {}
        duplicates_to_remove = []
        
        for card in cards:
            card_number = card.get('card_number', '').replace(' ', '')
            if card_number in seen:
                duplicates_to_remove.append(card['id'])
            else:
                seen[card_number] = card['id']
        
        # Remove duplicates
        removed_count = 0
        for card_id in duplicates_to_remove:
            try:
                supabase.table('credit_card_transactions').delete().eq('id', card_id).execute()
                removed_count += 1
            except Exception as e:
                logging.error(f"Error removing duplicate {card_id}: {e}")
        
        return {"message": f"Removed {removed_count} duplicate cards", "removed": removed_count}
    except Exception as e:
        logging.error(f"Error removing duplicates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/bin/{bin_number}", response_model=BinInfo)
async def lookup_bin(bin_number: str):
    """Lookup BIN information using binlist.net free API"""
    try:
        bin_clean = bin_number.replace(" ", "").replace("-", "")[:8]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://lookup.binlist.net/{bin_clean}",
                headers={"Accept-Version": "3"},
                timeout=10.0
            )
            
            if response.status_code == 404:
                return BinInfo()
            
            if response.status_code == 200:
                data = response.json()
                return BinInfo(
                    scheme=data.get("scheme"),
                    type=data.get("type"),
                    brand=data.get("brand"),
                    country=data.get("country", {}).get("name") if data.get("country") else None,
                    country_emoji=data.get("country", {}).get("emoji") if data.get("country") else None,
                    bank=data.get("bank", {}).get("name") if data.get("bank") else None,
                    prepaid=data.get("prepaid")
                )
            
            return BinInfo()
    except Exception as e:
        logging.error(f"Error looking up BIN {bin_number}: {e}")
        return BinInfo()

@api_router.post("/cards", response_model=CardResponse)
async def create_card(card_data: CardCreate):
    try:
        response = supabase.table('credit_card_transactions').insert(card_data.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        logging.error(f"Error creating card: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, card_data: CardUpdate):
    try:
        update_data = card_data.model_dump(exclude_unset=True)
        response = supabase.table('credit_card_transactions').update(update_data).eq('id', card_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating card {card_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cards/{card_id}")
async def delete_card(card_id: str):
    try:
        response = supabase.table('credit_card_transactions').delete().eq('id', card_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Card not found")
        return {"message": "Card deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting card {card_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    logger.info("Los Cards - Painel CCS API started")
