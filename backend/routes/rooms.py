from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import Room, get_db  # Importez depuis database.py
from sqlalchemy.orm import Session
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class RoomCreate(BaseModel):
    room_number: int
    capacity: int

@router.get("/rooms")
def get_rooms(db: Session = Depends(get_db)):
    logger.info("Récupération des chambres")
    rooms = db.query(Room).all()
    logger.info(f"Chambres récupérées : {len(rooms)}")
    return rooms

@router.post("/rooms")
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    logger.info(f"Création de la chambre : {room.room_number}")
    db_room = Room(
        room_number=room.room_number,
        capacity=room.capacity
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    logger.info(f"Chambre {room.room_number} créée")
    return db_room