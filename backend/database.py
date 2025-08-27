from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)
Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Mutuelle(Base):
    __tablename__ = "mutuelles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    numero = Column(Integer, nullable=False)
    adresse = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telephone = Column(String, nullable=False)

class Medecin(Base):
    __tablename__ = "medecins"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    specialty = Column(String)
    address = Column(String)
    phone = Column(String)
    email = Column(String)

class Resident(Base):
    __tablename__ = "residents"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    date_naissance = Column(String)
    mutuelle_id = Column(Integer, ForeignKey("mutuelles.id"))
    niss = Column(String)
    medecin_traitant_id = Column(Integer, ForeignKey("medecins.id"))
    medicaments = Column(String)
    room_number = Column(Integer)

class Room(Base):
    __tablename__ = "rooms"
    room_number = Column(Integer, primary_key=True)
    capacity = Column(Integer, nullable=False)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("residents.id"))
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    reason = Column(String)
    transporteur = Column(String)
    heure_transport = Column(String)

class Medication(Base):
    __tablename__ = "medications"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    active_ingredient = Column(String)
    cbip_link = Column(String)

class PatientMedication(Base):
    __tablename__ = "patient_medications"
    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("residents.id"))
    medication_id = Column(Integer, ForeignKey("medications.id"))
    dosage = Column(String)
    time_of_day = Column(String)
    frequency = Column(String)
    status = Column(Integer, default=0)

class Motif(Base):
    __tablename__ = "motifs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    email_verified = Column(Boolean, nullable=False)

# Configuration de la connexion à la base de données
engine = None

def set_db_connection(new_engine):
    global engine
    try:
        logger.debug("Setting up database connection and creating tables")
        if not new_engine:
            raise ValueError("Engine is not initialized")
        engine = new_engine
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        Base.metadata.create_all(bind=engine)
        logger.debug("Database connection and tables created successfully")
    except Exception as e:
        logger.error(f"Failed to set up database connection: {str(e)}", exc_info=True)
        raise

def get_db():
    if engine is None:
        logger.error("Engine is not initialized")
        raise RuntimeError("Database engine not initialized. Call set_db_connection first.")
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.debug(f"SessionLocal type after creation: {type(SessionLocal)}, value: {SessionLocal}")
        if not callable(SessionLocal):
            logger.error(f"SessionLocal is not callable, value: {SessionLocal}")
            raise RuntimeError("SessionLocal is not a callable sessionmaker")
        logger.debug("Database session factory created successfully")
        db = SessionLocal()
        logger.debug("Database session created successfully")
        yield db
    except Exception as e:
        logger.error(f"Failed to create database session: {str(e)}", exc_info=True)
        raise
    finally:
        db.close()
        logger.debug("Database session closed")