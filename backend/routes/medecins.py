from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import Medecin, get_db
from sqlalchemy.orm import Session
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class MedecinResponse(BaseModel):
    id: int
    name: str
    specialty: str
    address: str
    phone: str
    email: str

@router.get("/", response_model=list[MedecinResponse])
async def get_medecins(db: Session = Depends(get_db)):
    logger.info("Récupération des médecins")
    medecins = db.query(Medecin).all()
    logger.info(f"Médecins récupérés : {len(medecins)}")
    return medecins