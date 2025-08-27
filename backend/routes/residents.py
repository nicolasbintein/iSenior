from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import Resident, get_db
from sqlalchemy.orm import Session
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ResidentCreate(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    mutuelle_id: int
    niss: str
    medecin_traitant_id: int
    room_number: int

class ResidentUpdate(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    mutuelle_id: int
    niss: str
    medecin_traitant_id: int
    room_number: int

@router.get("/")
async def get_residents(db: Session = Depends(get_db)):
    logger.info("Récupération des résidents")
    residents = db.query(Resident).all()
    logger.info(f"Résidents récupérés : {len(residents)}")
    return residents

@router.get("/{resident_id}")
async def get_resident(resident_id: int, db: Session = Depends(get_db)):
    logger.info(f"Récupération du résident ID : {resident_id}")
    try:
        db_resident = db.query(Resident).filter(Resident.id == resident_id).first()
        if not db_resident:
            logger.warning(f"Résident ID {resident_id} non trouvé")
            raise HTTPException(status_code=404, detail="Résident non trouvé")
        logger.info(f"Résident ID {resident_id} récupéré")
        return db_resident
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du résident : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.post("/")
async def create_resident(resident: ResidentCreate, db: Session = Depends(get_db)):
    logger.info(f"Création du résident : {resident.nom} {resident.prenom}")
    db_resident = Resident(
        nom=resident.nom,
        prenom=resident.prenom,
        date_naissance=resident.date_naissance,
        mutuelle_id=resident.mutuelle_id,
        niss=resident.niss,
        medecin_traitant_id=resident.medecin_traitant_id,
        medicaments="[]",
        room_number=resident.room_number
    )
    db.add(db_resident)
    db.commit()
    db.refresh(db_resident)
    logger.info(f"Résident {resident.nom} {resident.prenom} créé")
    return db_resident

@router.put("/{resident_id}")
async def update_resident(resident_id: int, resident: ResidentUpdate, db: Session = Depends(get_db)):
    logger.info(f"Mise à jour du résident ID : {resident_id}")
    db_resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not db_resident:
        logger.warning(f"Résident ID {resident_id} non trouvé")
        raise HTTPException(status_code=404, detail="Résident non trouvé")
    
    db_resident.nom = resident.nom
    db_resident.prenom = resident.prenom
    db_resident.date_naissance = resident.date_naissance
    db_resident.mutuelle_id = resident.mutuelle_id
    db_resident.niss = resident.niss
    db_resident.medecin_traitant_id = resident.medecin_traitant_id
    db_resident.room_number = resident.room_number
    db.commit()
    db.refresh(db_resident)
    
    logger.info(f"Résident ID {resident_id} mis à jour")
    return db_resident

@router.delete("/{resident_id}")
async def delete_resident(resident_id: int, db: Session = Depends(get_db)):
    logger.info(f"Suppression du résident ID : {resident_id}")
    db_resident = db.query(Resident).filter(Resident.id == resident_id).first()
    if not db_resident:
        logger.warning(f"Résident ID {resident_id} non trouvé")
        raise HTTPException(status_code=404, detail="Résident non trouvé")
    
    db.delete(db_resident)
    db.commit()
    logger.info(f"Résident ID {resident_id} supprimé")
    return {"message": "Résident supprimé"}