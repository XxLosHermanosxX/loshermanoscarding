from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    card_number: Optional[str] = None
    expiry_month: Optional[str] = None
    expiry_year: Optional[str] = None
    cvv: Optional[str] = None
    cardholder_name: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Card Organizer API"}

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
    logger.info("Card Organizer API started - using Supabase REST API")
