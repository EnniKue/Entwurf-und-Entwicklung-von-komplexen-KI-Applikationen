# NovaTech Onboarding-Assistent

## Projektübersicht

Der NovaTech Onboarding-Assistent ist ein KI-gestützter Chatbot, der neue Mitarbeitende beim Einstieg in das Unternehmen unterstützt. Er beantwortet Fragen zu Unternehmensrichtlinien, Arbeitsabläufen, IT-Themen und organisatorischen Prozessen.

Zur Beantwortung von Anfragen kombiniert das System eine lokale Wissensbasis mit einem lokal ausgeführten Large Language Model (IBM Granite 4.1 über Ollama). Dadurch können sowohl unternehmensspezifische als auch allgemeine Fragestellungen beantwortet werden.

Das Projekt entstand im Rahmen des Moduls „Entwurf und Entwicklung von komplexen KI-Applikationen“.

---

## Funktionen

- KI-gestützter Onboarding-Chatbot
- Lokale Wissensbasis für Unternehmensrichtlinien
- Lokales Large Language Model (IBM Granite 4.1 über Ollama)
- Conversation Memory
- Erkennung sensibler Themen (Guardrails)
- Streaming der Antworten
- Aktivitätsverlauf (Trace Panel)
- Fortschrittsanzeige während der Antwortgenerierung
- Kontextmenü (Antwort kopieren, Chat löschen, Aktivitätsverlauf löschen)
- Logging aller Chatanfragen
- Fehlerbehandlung im Frontend

---

## Verwendete Technologien

### Frontend

- React
- TypeScript
- Vite

### Backend

- Python
- FastAPI
- OpenAI Python SDK (für die Anbindung an Ollama)
- Ollama
- IBM Granite 4.1 (3B)

---

## Projektstruktur

```text
NovaTech-Onboarding-Assistent
│
├── backend
│   ├── app
│   │   ├── models
│   │   ├── routes
│   │   └── services
│   ├── logs
│   ├── knowledge.json
│   ├── system_prompt.txt
│   ├── requirements.txt
│   └── .env
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── services
│   │   └── styles
│   └── package.json
│
├── docs
│   ├── diagrams
│   │   └── systemarchitektur.drawio
│   ├── images
│   │   ├── systemarchitektur.png
│   │   └── systemarchitektur.svg
│   └── documentation
│
└── README.md
```

---

## Systemarchitektur

Die Anwendung besteht aus einem React-Frontend und einem FastAPI-Backend.

Der Benutzer kommuniziert ausschließlich mit dem Frontend. Dieses sendet Anfragen an das Backend. Das Backend entscheidet anhand der Anfrage, ob eine Antwort aus der Wissensbasis geliefert oder das lokale Sprachmodell verwendet wird. Antworten werden per Server-Sent Events (SSE) an das Frontend übertragen und dort während der Generierung angezeigt.

Die folgende Abbildung zeigt die Systemarchitektur des NovaTech-Onboarding-Assistenten sowie den Datenfluss einer Benutzeranfrage zwischen Frontend, Backend, den verwendeten Ressourcen und dem lokalen Large Language Model.

![Systemarchitektur](docs/images/systemarchitektur.png)

---

## Projekt starten

### Voraussetzungen

- Python 3.11 oder neuer
- Node.js 20 oder neuer
- Ollama mit dem Modell IBM Granite 4.1 (3B)

### Backend

```bash
cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Projektstatus

Das Projekt befindet sich auf einem funktionsfähigen Stand und umfasst alle wesentlichen Komponenten eines KI-gestützten Onboarding-Assistenten:

- Frontend mit React
- FastAPI-Backend
- Conversation Memory
- Wissensbasis
- LLM-Anbindung
- Logging
- Guardrails
- Streaming
- Aktivitätsverlauf
- Fehlerbehandlung

Potenzielle Erweiterungen, beispielsweise eine Datenbankanbindung, ein Retrieval-Augmented Generation (RAG)-System oder eine Nachbearbeitung der LLM-Antworten im Backend, werden in der Projektdokumentation diskutiert.
---

## Autor

Projekt im Studiengang Wirtschaftsinformatik

Hochschule für Angewandte Wissenschaften Hamburg (HAW Hamburg)

Modul:
Entwurf und Entwicklung von komplexen KI-Applikationen

Sommersemester 2026