from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Motif  # Supprime l'importation de SessionLocal
from schemas import Motif as MotifSchema
import logging

logger = logging.getLogger(__name__)
logger.debug("Loading motifs module")
router = APIRouter()

# Utilise get_db() comme dépendance
def get_db():
    from database import get_db as db_generator  # Importation locale de get_db
    return next(db_generator())

@router.get("", response_model=list[MotifSchema])  # Route cohérente avec le préfixe /motifs
def read_motifs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.debug("Processing GET /motifs request")
        motifs = db.query(Motif).offset(skip).limit(limit).all()
        if not motifs:
            logger.warning("No motifs found in database")
        logger.debug(f"Returning {len(motifs)} motifs: {[m.name for m in motifs]}")
        return motifs
    except Exception as e:
        logger.error(f"Error in read_motifs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")

logger.debug("Motifs router initialized")