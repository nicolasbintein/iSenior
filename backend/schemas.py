from pydantic import BaseModel
from typing import Optional

class ResidentCreate(BaseModel):
    nom: str
    prenom: str
    date_naissance: str
    mutuelle_id: int
    niss: str
    medecin_traitant_id: int
    medicaments: str
    room_number: int

class Resident(ResidentCreate):
    id: int
    resident_name: str  # Ajout temporaire pour compatibilité

    class Config:
        from_attributes = True

class Mutuelle(BaseModel):
    id: int
    name: str
    address: str
    phone: str
    email: str

    class Config:
        from_attributes = True

class Medecin(BaseModel):
    id: int
    name: str
    specialty: str
    address: str
    phone: str
    email: str

    class Config:
        from_attributes = True

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
    resident_id: Optional[int] = None  # Rendre resident_id optionnel
    date: str
    time: str
    reason: str
    transporteur: Optional[str] = None
    heure_transport: Optional[str] = None

    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    name: str
    active_ingredient: str
    cbip_link: str

class Medication(MedicationCreate):
    id: int

    class Config:
        from_attributes = True

class PatientMedicationCreate(BaseModel):
    resident_id: int
    medication_id: int
    dosage: str
    time_of_day: str
    frequency: str
    status: int

class PatientMedication(PatientMedicationCreate):
    id: int

    class Config:
        from_attributes = True

class Motif(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    status: str
    email: str
    phone: str
    email_verified: bool

class User(UserCreate):
    id: int

    class Config:
        from_attributes = True