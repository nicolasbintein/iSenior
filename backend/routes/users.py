from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import User, get_db  # Importez depuis database.py
from sqlalchemy.orm import Session
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class UserUpdate(BaseModel):
    username: str
    role: str
    status: str
    email: str
    phone: str

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    logger.info("Récupération des utilisateurs")
    users = db.query(User).all()
    logger.info(f"Utilisateurs récupérés : {len(users)}")
    return users

@router.put("/users/{user_id}")
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    logger.info(f"Mise à jour de l'utilisateur ID : {user_id}")
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        logger.warning(f"Utilisateur ID {user_id} non trouvé")
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db_user.username = user.username
    db_user.role = user.role
    db_user.status = user.status
    db_user.email = user.email
    db_user.phone = user.phone
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"Utilisateur ID {user_id} mis à jour")
    return db_user