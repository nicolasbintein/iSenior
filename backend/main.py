from fastapi import FastAPI, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.residents import router as residents_router
from routes.appointments import router as appointments_router
from routes.medications import router as medications_router
from routes.chat import router as chat_router
from routes.rooms import router as rooms_router
from routes.mutuelles import router as mutuelles_router
from routes.medecins import router as medecins_router
from routes.motifs import router as motifs_router
from database import set_db_connection, get_db
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import logging

logger = logging.getLogger(__name__)
app = FastAPI()

# Configurer la connexion à la base de données
DB_PATH = "sqlite:///residents_default.db"
try:
    engine = create_engine(DB_PATH, connect_args={"check_same_thread": False})
    set_db_connection(engine)
    logger.debug("Database connection initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize database connection: {str(e)}", exc_info=True)
    raise

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin"],
    max_age=3600,
)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message reçu : {data}")
    except Exception as e:
        await websocket.close()

# Inclure les routes
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(residents_router, prefix="/residents")
app.include_router(appointments_router, prefix="/appointments")
app.include_router(medications_router, prefix="/medications")
app.include_router(chat_router, prefix="/chat")
app.include_router(rooms_router, prefix="/rooms")
app.include_router(mutuelles_router, prefix="/mutuelles")
app.include_router(medecins_router, prefix="/medecins")
app.include_router(motifs_router, prefix="/motifs")

# Endpoint manuel pour tester les motifs
@app.get("/manual-motifs")
async def manual_motifs(db: Session = Depends(get_db)):
    try:
        motifs = db.query(Motif).all()
        return [{"id": m.id, "name": m.name} for m in motifs]
    except Exception as e:
        return {"error": str(e)}

@app.get("/test")
async def test_endpoint():
    return {"message": "Backend is running"}