from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import logging
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from database import get_db, User, Resident, Mutuelle, Medecin, Room, Appointment, Medication, PatientMedication, Motif
import openai

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str

# Configure l'API OpenAI
openai.api_key = "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"

@router.post("/")
async def chat(message: ChatMessage, db: Session = Depends(get_db)):
    logger.info(f"Message reçu: {message.message}")
    try:
        # Vérifie la connexion à la base avec text()
        with db as session:
            session.execute(text("SELECT 1"))
        logger.info("Connexion à la base OK")

        # Récupère l'utilisateur (simplifié, à adapter)
        username = "bintein_nicolas"
        user = db.query(User).filter(User.username == username).first()
        if not user:
            logger.error(f"Utilisateur {username} non trouvé")
            raise HTTPException(status_code=404, detail="User not found")

        # Récupère toutes les données pertinentes
        residents = db.query(Resident).limit(5).all()
        mutuelles = db.query(Mutuelle).limit(5).all()
        medecins = db.query(Medecin).limit(5).all()
        rooms = db.query(Room).limit(5).all()
        appointments = db.query(Appointment).join(Resident, Appointment.resident_id == Resident.id).limit(5).all()
        medications = db.query(Medication).limit(5).all()
        patient_medications = db.query(PatientMedication).join(Resident, PatientMedication.resident_id == Resident.id).limit(5).all()
        motifs = db.query(Motif).limit(5).all()

        # Construit le contexte avec liaisons
        context_parts = [
            f"Utilisateur: {user.username}, Rôle: {user.role}",
            f"Résidents récents: {[r.nom + ' ' + r.prenom for r in residents if residents]}",
            f"Mutuelles: {[m.name for m in mutuelles if mutuelles]}",
            f"Médecins: {[m.name for m in medecins if medecins]}",
            f"Chambres: {[r.room_number for r in rooms if rooms]}",
            f"Rendez-vous récents: {[a.date + ' ' + a.reason + ' pour résident ' + db.query(Resident).filter(Resident.id == a.resident_id).first().prenom + ' ' + db.query(Resident).filter(Resident.id == a.resident_id).first().nom for a in appointments if appointments]}",
            f"Médicaments: {[m.name for m in medications if medications]}",
            f"Médicaments des patients: {[f'{db.query(Resident).filter(Resident.id == pm.resident_id).first().prenom} {db.query(Resident).filter(Resident.id == pm.resident_id).first().nom}: {pm.dosage}' for pm in patient_medications if patient_medications]}",
            f"Motifs: {[m.name for m in motifs if motifs]}"
        ]
        context = ". ".join(part for part in context_parts if part)

        logger.info(f"Contexte envoyé à ChatGPT: {context}")  # Débogage

        # Prompt système strict
        system_prompt = (
            "Tu es un assistant pour iSenior. Utilise UNIQUEMENT les données fournies dans le contexte pour répondre. "
            "Lorsque tu parles de RDV ou de médicaments, mentionne toujours le nom du résident associé. "
            "Si aucune donnée pertinente n'est disponible, réponds : 'Désolé, je n'ai pas assez d'informations pour répondre.' "
            "Contexte: {context}"
        )

        # Utilise la nouvelle syntaxe OpenAI v1.x
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt.format(context=context)},
                {"role": "user", "content": message.message}
            ],
            temperature=0.7
        )
        reply = response.choices[0].message.content

        logger.info(f"Réponse générée: {reply}")
        return {"reply": reply}

    except openai.AuthenticationError as e:
        logger.error(f"Erreur d'authentification OpenAI: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid API key")
    except Exception as e:
        logger.error(f"Erreur lors du traitement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))