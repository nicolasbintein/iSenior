from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import Mutuelle, get_db
from sqlalchemy.orm import Session
import logging
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)

class MutuelleResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

@router.get("/", response_model=list[MutuelleResponse])
async def get_mutuelles(db: Session = Depends(get_db)):
    logger.info("Récupération des mutuelles")
    mutuelles = db.query(Mutuelle).all()
    logger.info(f"Mutuelles récupérées : {len(mutuelles)}")
    return mutuelles