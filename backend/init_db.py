import os
import logging
import sqlite3
from database import pwd_context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db_name="residents_default.db"):
    db_path = os.path.abspath(db_name)
    if os.path.exists(db_path):
        os.remove(db_path)
        logger.info(f"Base de données existante {db_path} supprimée")
    
    # Créer la base avec sqlite3
    conn = sqlite3.connect(db_path)
    conn.execute('PRAGMA foreign_keys = ON;')
    cursor = conn.cursor()
    
    # Créer les tables avec la nouvelle structure pour mutuelles
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS mutuelles (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            numero INTEGER NOT NULL,
            adresse TEXT NOT NULL,
            email TEXT NOT NULL,
            telephone TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS medecins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            specialty TEXT,
            address TEXT,
            phone TEXT,
            email TEXT
        );
        CREATE TABLE IF NOT EXISTS residents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            date_naissance TEXT NOT NULL,
            mutuelle_id INTEGER,
            niss TEXT,
            medecin_traitant_id INTEGER,
            medicaments TEXT,
            room_number INTEGER,
            FOREIGN KEY(mutuelle_id) REFERENCES mutuelles(id),
            FOREIGN KEY(medecin_traitant_id) REFERENCES medecins(id)
        );
        CREATE TABLE IF NOT EXISTS rooms (
            room_number INTEGER PRIMARY KEY,
            capacity INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            active_ingredient TEXT,
            cbip_link TEXT
        );
        CREATE TABLE IF NOT EXISTS patient_medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resident_id INTEGER,
            medication_id INTEGER,
            dosage TEXT,
            time_of_day TEXT,
            frequency TEXT,
            status INTEGER,
            FOREIGN KEY(resident_id) REFERENCES residents(id),
            FOREIGN KEY(medication_id) REFERENCES medications(id)
        );
        CREATE TABLE IF NOT EXISTS motifs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            email_verified INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resident_id INTEGER,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            reason TEXT,
            transporteur TEXT,
            heure_transport TEXT,
            FOREIGN KEY(resident_id) REFERENCES residents(id)
        );
    """)
    conn.commit()
    logger.info(f"Tables créées dans {db_path}")

    # Insérer les nouvelles données mutuelles
    mutuelles = [
        (1, "Mutualités Chrétiennes (SMR MC)", 100, "Chaussée de Haecht 579/41, 1031 Schaerbeek",
         "accord.mr@mc.be;tierspayant.mr@mc.be;accord.bandagiste@mc.be;tierspayant.bandagiste@mc.be;accord.revalidation.smr@mc.be;tierspayant.revalidation.smr@mc.be;srh@mc.be",
         "071548484;042217394;025015544"),
        (2, "Mutualités Neutres (SMR Neutre Wallonie)", 200, "Chaussée de Charleroi 147, 1060 Bruxelles",
         "wallonie200SDS@unmn.be;goedkeuringen@vnz.be;mrs-mrpa@lamn.be;maisonrepos-rustoord@mutualia.be;verstrekkingen@nzvl.be;DL200_Medical-Medisch@union-neutre.be",
         "023001103;025330604"),
        (3, "Mutualités Socialistes - Solidaris", 300, "Rue Saint-Jean 32-38, 1000 Bruxelles",
         "Factuur.300@socmut.be;tarification.317@solidaris.be;prestataires315@solidaris.be;305.6RFSSA@solidaris.be;Ssa.Liege@solidaris.be;cl-325-adm-acc@solidaris.be;DL-323-AccordMC@mutsoc.be",
         "025150321;071507310;068848431;023910955"),
        (4, "Mutualités Libérales - Wallomut", 400, "Rue de Livourne 25, 1050 Bruxelles",
         "wallomut@ml.be;Mc409@ml.be", "025428835;025428724;064236190"),
        (5, "Mutualités Libres - SMR Wal", 500, "Route de Lennik 788A, 1070 Bruxelles",
         "smrwal@mloz.be;medsmrwal@mloz.be", "027789555;027789610;027789295"),
        (6, "CAAMI - Caisse Auxiliaire d’Assurance Maladie-Invalidité", 600, "Rue du Trône 30A, 1000 Bruxelles",
         "elecfac@caami.be;medadmin@caami.be;tarif_ostbelgien@hkiv.be;tarif_vlaanderen@hziv.be;medzorgen@caami-hziv.fgov.be",
         "022293433;022276244;080330896;032207555;022276275"),
        (7, "HR Rail - Caisse des soins de santé", 900, "Rue de France 85, 1060 Bruxelles",
         "900-factura@hr-rail.be;cmrbruxelles@hr-rail.be;ggcbrugge@hr-rail.be;ggchasselt@hr-rail.be;cmrnamur@hr-rail.be;cmrmons@hr-rail.be",
         "025253556")
    ]
    cursor.executemany("INSERT INTO mutuelles (id, name, numero, adresse, email, telephone) VALUES (?, ?, ?, ?, ?, ?)", mutuelles)

    # Insérer des médecins exemples
    medecins = [
        ('Dr. Smith', 'Généraliste', 'Adresse exemple 1, Bruxelles', '02/1234567', 'dr.smith@example.com'),
        ('Dr. Jones', 'Généraliste', 'Adresse exemple 2, Bruxelles', '02/7654321', 'dr.jones@example.com')
    ]
    for medecin in medecins:
        cursor.execute("INSERT INTO medecins (name, specialty, address, phone, email) VALUES (?, ?, ?, ?, ?)", medecin)
    
    # Insérer les motifs
    motifs = [
        "Consultation médicale",
        "Famille",
        "Notaire - Avocat",
        "Sortie culturelle",
        "Shopping",
        "Visite médicale",
        "Rendez-vous administratif",
        "Réunion familiale",
        "Thérapie",
        "Autre"
    ]
    for motif in motifs:
        cursor.execute("INSERT INTO motifs (name) VALUES (?)", (motif,))

    # Insérer les données
    cursor.execute("INSERT INTO rooms (room_number, capacity) VALUES (?, ?)", (101, 2))
    cursor.execute("INSERT INTO rooms (room_number, capacity) VALUES (?, ?)", (102, 2))
    cursor.execute("INSERT INTO residents (nom, prenom, date_naissance, mutuelle_id, niss, medecin_traitant_id, medicaments, room_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                   ('Dupont', 'Marie', '1940-05-15', 1, '12345678901', 1, '[]', 101))
    cursor.execute("INSERT INTO residents (nom, prenom, date_naissance, mutuelle_id, niss, medecin_traitant_id, medicaments, room_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                   ('Martin', 'Pierre', '1935-08-22', 2, '98765432109', 2, '[]', 102))
    cursor.execute("INSERT INTO medications (name, active_ingredient, cbip_link) VALUES (?, ?, ?)",
                   ('Paracétamol', 'Paracétamol', 'https://cbip.be/fr/drugs/123'))
    cursor.execute("INSERT INTO medications (name, active_ingredient, cbip_link) VALUES (?, ?, ?)",
                   ('Ibuprofène', 'Ibuprofène', 'https://cbip.be/fr/drugs/456'))
    cursor.execute("INSERT INTO patient_medications (resident_id, medication_id, dosage, time_of_day, frequency, status) VALUES (?, ?, ?, ?, ?, ?)",
                   (1, 1, '500mg', 'Matin', '3x/jour', 0))
    cursor.execute("INSERT INTO patient_medications (resident_id, medication_id, dosage, time_of_day, frequency, status) VALUES (?, ?, ?, ?, ?, ?)",
                   (2, 2, '200mg', 'Soir', '2x/jour', 0))
    cursor.execute("INSERT INTO users (username, password, role, status, email, phone, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   ('dupont_jean', pwd_context.hash("password123!"), 'Directeur', 'approved', 'jean.dupont@example.com', '0123456789', 1))
    cursor.execute("INSERT INTO users (username, password, role, status, email, phone, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   ('bintein_nicolas', pwd_context.hash("password123!"), 'Infirmière', 'approved', 'nicolas.bintein@example.com', '0987654321', 1))

    # Insérer des RDVs avec transporteur et heure_transport
    cursor.execute("INSERT INTO appointments (resident_id, date, time, reason, transporteur, heure_transport) VALUES (?, ?, ?, ?, ?, ?)",
                   (1, '2025-09-01', '10:00', 'Consultation médicale', 'Transport A', '09:30'))
    cursor.execute("INSERT INTO appointments (resident_id, date, time, reason, transporteur, heure_transport) VALUES (?, ?, ?, ?, ?, ?)",
                   (2, '2025-09-02', '14:00', 'Examen dentaire', 'Transport B', '13:30'))

    conn.commit()
    logger.info("Données insérées")

    # Vérifier les tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    logger.info(f"Tables dans sqlite3 : {tables}")

    conn.close()
    print(f"Base de données {db_path} initialisée avec succès !")

if __name__ == "__main__":
    init_db()