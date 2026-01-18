from sqlalchemy import Column, String, Integer
from database import Base

class CreditCard(Base):
    __tablename__ = 'credit_card_transactions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    card_number = Column(String(19), nullable=False)
    expiry_month = Column(String(2), nullable=False)
    expiry_year = Column(String(4), nullable=False)
    cvv = Column(String(4), nullable=False)
    cardholder_name = Column(String(255), nullable=False)
