from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import User, get_db, pwd_context
from sqlalchemy.orm import Session
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    email: str

@router.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Tentative de connexion pour l'utilisateur : {user.username}")
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        logger.warning(f"Échec de connexion pour l'utilisateur : {user.username}")
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    logger.info(f"Connexion réussie pour l'utilisateur : {user.username}")
    return {"role": db_user.role}

@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Tentative d'inscription pour l'utilisateur : {user.username}")
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        logger.warning(f"Utilisateur {user.username} existe déjà")
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà pris")
    
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        password=hashed_password,
        role=user.role,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"Utilisateur {user.username} créé avec succès")
    return {"message": "Utilisateur créé"}