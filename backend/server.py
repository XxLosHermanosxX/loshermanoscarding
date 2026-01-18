from fastapi import FastAPI, APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, engine, Base
from models import CreditCard

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    id: int

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
async def get_cards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CreditCard).order_by(CreditCard.id.desc()))
    cards = result.scalars().all()
    return cards

@api_router.get("/cards/{card_id}", response_model=CardResponse)
async def get_card(card_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CreditCard).where(CreditCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

@api_router.post("/cards", response_model=CardResponse)
async def create_card(card_data: CardCreate, db: AsyncSession = Depends(get_db)):
    card = CreditCard(**card_data.model_dump())
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@api_router.put("/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: int, card_data: CardUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CreditCard).where(CreditCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    update_data = card_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(card, key, value)
    
    await db.commit()
    await db.refresh(card)
    return card

@api_router.delete("/cards/{card_id}")
async def delete_card(card_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CreditCard).where(CreditCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    await db.delete(card)
    await db.commit()
    return {"message": "Card deleted successfully"}

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
    logger.info("Starting up - tables should already exist in Supabase")

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
