from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from database import Appointment, Resident, get_db
from sqlalchemy.orm import Session
from sqlalchemy import join
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

class AppointmentCreate(BaseModel):
    resident_id: int
    date: str
    time: str
    reason: str
    transporteur: str
    heure_transport: str

class AppointmentResponse(BaseModel):
    id: int
    resident_id: int
    date: str
    time: str
    reason: str
    transporteur: str
    heure_transport: str
    resident_name: str

class AppointmentUpdate(BaseModel):
    resident_id: int
    date: str
    time: str
    reason: str
    transporteur: str
    heure_transport: str

@router.get("/", response_model=list[AppointmentResponse])
async def get_appointments(db: Session = Depends(get_db), resident_id: int = Query(None)):
    logger.debug("Début de la récupération des rendez-vous")
    try:
        query = db.query(Appointment, Resident.prenom, Resident.nom).join(Resident, Appointment.resident_id == Resident.id)
        if resident_id:
            query = query.filter(Appointment.resident_id == resident_id)
        appointments = query.all()
        result = [
            AppointmentResponse(
                id=appointment.id,
                resident_id=appointment.resident_id,
                date=appointment.date,
                time=appointment.time,
                reason=appointment.reason,
                transporteur=appointment.transporteur or "",
                heure_transport=appointment.heure_transport or "",
                resident_name=f"{resident_prenom} {resident_nom}"
            )
            for appointment, resident_prenom, resident_nom in appointments
        ]
        logger.debug(f"Rendez-vous récupérés : {len(result)}")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des rendez-vous : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Récupération du rendez-vous ID : {appointment_id}")
    try:
        appointment = db.query(Appointment, Resident.prenom, Resident.nom).join(
            Resident, Appointment.resident_id == Resident.id
        ).filter(Appointment.id == appointment_id).first()
        if not appointment:
            logger.warning(f"Rendez-vous ID {appointment_id} non trouvé")
            raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
        appointment, resident_prenom, resident_nom = appointment
        result = AppointmentResponse(
            id=appointment.id,
            resident_id=appointment.resident_id,
            date=appointment.date,
            time=appointment.time,
            reason=appointment.reason,
            transporteur=appointment.transporteur or "",
            heure_transport=appointment.heure_transport or "",
            resident_name=f"{resident_prenom} {resident_nom}"
        )
        logger.debug(f"Rendez-vous ID {appointment_id} récupéré")
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du rendez-vous : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    logger.debug(f"Création d'un rendez-vous pour résident ID : {appointment.resident_id}")
    try:
        db_appointment = Appointment(
            resident_id=appointment.resident_id,
            date=appointment.date,
            time=appointment.time,
            reason=appointment.reason,
            transporteur=appointment.transporteur,
            heure_transport=appointment.heure_transport
        )
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        resident = db.query(Resident).filter(Resident.id == db_appointment.resident_id).first()
        if resident:
            db_appointment.resident_name = f"{resident.prenom} {resident.nom}"
        logger.debug(f"Rendez-vous créé pour résident ID : {appointment.resident_id}")
        return db_appointment
    except Exception as e:
        logger.error(f"Erreur lors de la création du rendez-vous : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(appointment_id: int, appointment: AppointmentUpdate, db: Session = Depends(get_db)):
    logger.debug(f"Mise à jour du rendez-vous ID : {appointment_id}")
    try:
        db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not db_appointment:
            logger.warning(f"Rendez-vous ID {appointment_id} non trouvé")
            raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
        
        db_appointment.resident_id = appointment.resident_id
        db_appointment.date = appointment.date
        db_appointment.time = appointment.time
        db_appointment.reason = appointment.reason
        db_appointment.transporteur = appointment.transporteur
        db_appointment.heure_transport = appointment.heure_transport
        db.commit()
        db.refresh(db_appointment)
        resident = db.query(Resident).filter(Resident.id == db_appointment.resident_id).first()
        if resident:
            db_appointment.resident_name = f"{resident.prenom} {resident.nom}"
        logger.debug(f"Rendez-vous ID {appointment_id} mis à jour")
        return db_appointment
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du rendez-vous : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Suppression du rendez-vous ID : {appointment_id}")
    try:
        db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not db_appointment:
            logger.warning(f"Rendez-vous ID {appointment_id} non trouvé")
            raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
        
        db.delete(db_appointment)
        db.commit()
        logger.debug(f"Rendez-vous ID {appointment_id} supprimé")
        return {"message": "Rendez-vous supprimé"}
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du rendez-vous : {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")