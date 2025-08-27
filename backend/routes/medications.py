from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from database import PatientMedication, Resident, Medication, get_db
from sqlalchemy.orm import Session
from sqlalchemy import join
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class MedicationCreate(BaseModel):
    resident_id: int
    medication_id: int
    dosage: str
    time_of_day: str
    frequency: str
    status: int

class MedicationResponse(BaseModel):
    id: int
    resident_name: str
    medication_name: str
    dosage: str
    time_of_day: str
    frequency: str
    status: int

class MedicationUpdate(BaseModel):
    resident_id: int
    medication_id: int
    dosage: str
    time_of_day: str
    frequency: str
    status: int

@router.get("/", response_model=list[MedicationResponse])
async def get_medications(db: Session = Depends(get_db), resident_id: int = Query(None)):
    logger.info("Récupération des patient_medications")
    try:
        query = db.query(PatientMedication, Resident.prenom, Resident.nom, Medication.name).join(Resident, PatientMedication.resident_id == Resident.id).join(Medication, PatientMedication.medication_id == Medication.id)
        if resident_id:
            query = query.filter(PatientMedication.resident_id == resident_id)
        medications = query.all()
        result = [
            MedicationResponse(
                id=patient_medication.id,
                resident_name=f"{resident_prenom} {resident_nom}",
                medication_name=medication_name,
                dosage=patient_medication.dosage,
                time_of_day=patient_medication.time_of_day,
                frequency=patient_medication.frequency,
                status=patient_medication.status
            )
            for patient_medication, resident_prenom, resident_nom, medication_name in medications
        ]
        logger.info(f"Patient_medications récupérés : {len(result)}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des patient_medications : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.post("/", response_model=MedicationCreate)
async def create_medication(medication: MedicationCreate, db: Session = Depends(get_db)):
    logger.info(f"Création d'un patient_medication pour résident ID : {medication.resident_id}")
    try:
        db_medication = PatientMedication(
            resident_id=medication.resident_id,
            medication_id=medication.medication_id,
            dosage=medication.dosage,
            time_of_day=medication.time_of_day,
            frequency=medication.frequency,
            status=medication.status
        )
        db.add(db_medication)
        db.commit()
        db.refresh(db_medication)
        logger.info(f"Patient_medication créé pour résident ID : {medication.resident_id}")
        return db_medication
    except Exception as e:
        logger.error(f"Erreur lors de la création du patient_medication : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.put("/{medication_id}", response_model=MedicationUpdate)
async def update_medication(medication_id: int, medication: MedicationUpdate, db: Session = Depends(get_db)):
    logger.info(f"Mise à jour du patient_medication ID : {medication_id}")
    try:
        db_medication = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
        if not db_medication:
            logger.warning(f"Patient_medication ID {medication_id} non trouvé")
            raise HTTPException(status_code=404, detail="Patient_medication non trouvé")
        
        db_medication.resident_id = medication.resident_id
        db_medication.medication_id = medication.medication_id
        db_medication.dosage = medication.dosage
        db_medication.time_of_day = medication.time_of_day
        db_medication.frequency = medication.frequency
        db_medication.status = medication.status
        db.commit()
        db.refresh(db_medication)
        
        logger.info(f"Patient_medication ID {medication_id} mis à jour")
        return db_medication
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du patient_medication : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.delete("/{medication_id}")
async def delete_medication(medication_id: int, db: Session = Depends(get_db)):
    logger.info(f"Suppression du patient_medication ID : {medication_id}")
    try:
        db_medication = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
        if not db_medication:
            logger.warning(f"Patient_medication ID {medication_id} non trouvé")
            raise HTTPException(status_code=404, detail="Patient_medication non trouvé")
        
        db.delete(db_medication)
        db.commit()
        logger.info(f"Patient_medication ID {medication_id} supprimé")
        return {"message": "Patient_medication supprimé"}
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du patient_medication : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")