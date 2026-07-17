# NovaTech-Onboarding-Assistent

## Projektübersicht

Der **NovaTech-Onboarding-Assistent** ist eine KI-gestützte Webanwendung, die neue Mitarbeitende während ihres Onboardings unterstützt. Der Chatbot beantwortet organisatorische Fragen, beispielsweise zu Unternehmensrichtlinien, IT-Themen und internen Abläufen.

Zur Beantwortung von Anfragen kombiniert die Anwendung eine kuratierte Wissensbasis mit einem lokal ausgeführten Large Language Model (LLM). Je nach Anfrage entscheidet das Backend automatisch, ob eine Antwort aus der Wissensbasis geliefert, eine Eskalation durchgeführt oder das Sprachmodell verwendet wird.

Das Projekt entstand im Rahmen des Moduls **„Entwurf und Entwicklung von komplexen KI-Applikationen“**.

---

# Funktionen

- KI-gestützter Onboarding-Chatbot
- Lokale Wissensbasis für Unternehmensinformationen
- Lokales Large Language Model (IBM Granite 4.1 über Ollama)
- Conversation Memory
- Guardrails zur Erkennung sensibler Themen
- Streaming der Antwortgenerierung
- Aktivitätsverlauf (Trace Panel)
- Fortschrittsanzeige während der Verarbeitung
- Kontextmenü (Antwort kopieren, Chat löschen, Aktivitätsverlauf löschen)
- Logging aller Anfragen
- Fehlerbehandlung

---

# Verarbeitungswege

Der Assistent unterstützt drei unterschiedliche Verarbeitungswege.

### Wissensbasis

Bekannte Standardfragen werden direkt aus der Wissensbasis beantwortet.

**Beispiel:**

- Wie lautet das WLAN-Passwort?

### Eskalation

Sensible Themen werden nicht durch das Sprachmodell beantwortet. Stattdessen verweist die Anwendung auf die zuständige Ansprechperson.

**Beispiele:**

- Kündigung
- Gehalt
- Krankheit
- Diskriminierung
- arbeitsrechtliche Fragestellungen

### LLM-Fallback

Unbekannte und nicht sensible Fragen werden mithilfe des lokalen Sprachmodells beantwortet. Dabei wird die Wissensbasis als Kontext für die Antwortgenerierung genutzt.

---

# Verwendete Technologien

## Frontend

- React
- TypeScript
- Vite
- CSS
- Server-Sent Events (SSE)

## Backend

- Python
- FastAPI
- OpenAI Python SDK (OpenAI-kompatible Schnittstelle)
- Ollama
- IBM Granite 4.1 (3B)

---

# Projektstruktur

```text
NovaTech-Onboarding-Assistent
│
├── backend
│   ├── app
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── main.py
│   ├── logs
│   ├── .env.example
│   ├── knowledge.json
│   ├── requirements.txt
│   ├── system_prompt.txt
│   └── test_http.py
│
├── docs
│   ├── diagrams
│   └── images
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── services
│   │   └── styles
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

# Systemarchitektur

Die Anwendung besteht aus einem React-Frontend und einem FastAPI-Backend.

Der Benutzer kommuniziert ausschließlich mit dem Frontend. Dieses übermittelt die Anfrage an das Backend. Dort wird entschieden, ob die Antwort aus der Wissensbasis stammt, eine Eskalation erforderlich ist oder das lokale Sprachmodell verwendet wird.

Während der Verarbeitung überträgt das Backend Statusinformationen über **Server-Sent Events (SSE)** an das Frontend. Dadurch können der Aktivitätsverlauf und die Fortschrittsanzeige in Echtzeit dargestellt werden.

Die folgende Abbildung zeigt die Systemarchitektur des NovaTech-Onboarding-Assistenten.

![Systemarchitektur](docs/images/systemarchitektur.png)

---

# Voraussetzungen

Für den Betrieb werden folgende Komponenten benötigt:

- Python 3.11 oder neuer
- Node.js 20 oder neuer
- npm
- Ollama
- Modell **IBM Granite 4.1 (3B)**

---

# Konfiguration

Vor dem ersten Start muss die Datei

```text
backend/.env.example
```

nach

```text
backend/.env
```

kopiert werden.

Anschließend sind die erforderlichen Konfigurationswerte (z. B. `BASE_URL`, `API_KEY` und `MODEL_NAME`) einzutragen.

---

# Projekt starten

## Backend

```bash
cd backend

python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Abhängigkeiten installieren:

```bash
pip install -r requirements.txt
```

Backend starten:

```bash
uvicorn app.main:app --reload --port 8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Anwendung

Nach dem Start ist die Anwendung unter folgenden Adressen erreichbar:

| Dienst | Adresse |
|---------|----------|
| Frontend | http://localhost:5173 |
| Backend | http://127.0.0.1:8000 |
| Swagger UI | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |

---

# Beispielanfragen

| Anfrage | Verarbeitungsweg |
|----------|------------------|
| Wie viel Urlaub habe ich? | Wissensbasis |
| Ich möchte kündigen. | Eskalation |
| Erkläre mir den Unterschied zwischen Machine Learning und Deep Learning. | LLM-Fallback |

---

# Projektstatus

Der NovaTech-Onboarding-Assistent befindet sich auf einem funktionsfähigen Stand und umfasst die wesentlichen Komponenten eines KI-gestützten Onboarding-Systems.

Umgesetzt wurden:

- React-Frontend
- FastAPI-Backend
- Lokale Wissensbasis
- LLM-Anbindung
- Conversation Memory
- Guardrails
- Logging
- Streaming
- Aktivitätsverlauf
- Fortschrittsanzeige
- Fehlerbehandlung

Mögliche Erweiterungen, beispielsweise eine Datenbankanbindung, ein Retrieval-Augmented Generation (RAG)-System oder eine weiterführende Optimierung der Antwortgenerierung, werden in der Projektdokumentation diskutiert.

---

# Autor

**Studiengang:** Wirtschaftsinformatik

**Hochschule:** Hochschule für angewandtes Management

**Modul:** Entwurf und Entwicklung von komplexen KI-Applikationen

**Semester:** Sommersemester 2026