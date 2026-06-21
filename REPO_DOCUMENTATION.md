# 🎓 Clahan Academy V2 - Application Repository Documentation

This repository houses the core microservices for **Clahan Academy V2**, a cloud-native, secure, and AI-proctored online exam portal. It is structured as a monorepo consisting of eight specialized microservices, built primarily with Node.js/TypeScript, Python, and React.

---

## 🏗️ Repository Architecture

The monorepo contains the following folders and services:

```
clahan-academy-app/
├── admin-service/          # Institution & user management (Express/TypeScript)
├── ai-service/             # YOLO/InsightFace proctoring models (FastAPI/Python)
├── auth-service/           # Authentication & rate limiting (Express/TypeScript)
├── exam-service/           # Exam logic & automatic grading (Express/TypeScript)
├── frontend-service/       # Student and Admin dashboard portal (React/Vite/TypeScript)
├── notification-service/   # BullMQ transactional email worker (Node.js/TypeScript)
├── proctoring-service/     # Real-time WebSocket proctoring telemetry (Express/TypeScript)
├── student-service/        # Student profile and exam history tracker (Express/TypeScript)
├── docker-compose.yml      # Orchestrates all services locally for development
└── sonar-project.properties# SonarCloud configuration for static analysis
```

---

## 🛠️ Microservice Details

### 1. 🖥️ Frontend Service (`frontend-service`)
*   **Technology**: React v18, Vite, TypeScript, Tailwind CSS.
*   **Purpose**: The central dashboard for both students (taking exams, viewing history) and administrators (creating exams, managing students, reviewing proctoring logs).
*   **Key Scripts**: `npm run dev` (Vite dev server on port `5173`), `npm run build` (production build outputting to `/dist`).
*   **Configuration**: Configured via `.env` (maps backend API routes and WebSocket connections).

### 2. 🔑 Authentication Service (`auth-service`)
*   **Technology**: Node.js, Express, TypeScript, JWT, Redis.
*   **Purpose**: Handles user sign-in, token issuance, secure sign-out, OTP validations, and route rate-limiting.
*   **Key Files**:
    *   `src/index.ts`: Entrypoint containing authentication middleware and routes.
    *   `src/db.ts`: Database client and pool management.
    *   `src/middleware.ts`: JWT verification and access control.

### 3. 🏛️ Admin Service (`admin-service`)
*   **Technology**: Node.js, Express, TypeScript, PostgreSQL.
*   **Purpose**: API endpoints for managers/trainers to manage institutions, departments, batches, and student lists.
*   **Key Files**:
    *   `src/index.ts`: CRUD endpoints for administrative metadata.

### 4. 📝 Student Service (`student-service`)
*   **Technology**: Node.js, Express, TypeScript, PostgreSQL.
*   **Purpose**: Manages student profile details, enrollment states, and personal exam records.

### 5. ⏱️ Exam Service (`exam-service`)
*   **Technology**: Node.js, Express, TypeScript, PostgreSQL, Redis/BullMQ.
*   **Purpose**: The core engine orchestrating exam authoring, question bank creation, exam timers, grading logic, and connection to Judge0 for coding compilation tasks. It also interfaces with local Ollama (phi3) containers to automatically evaluate descriptive answers.

### 6. 👁️ AI Service (`ai-service`)
*   **Technology**: Python 3.11, FastAPI, YOLO v8 (ONNX), InsightFace, OpenCV.
*   **Purpose**: Performs computer vision tasks on video feeds uploaded or streamed by students. It verifies the identity of the student using face recognition and runs object detection to identify books, cellphones, and multiple faces.
*   **Key Files**:
    *   `main.py`: FastAPI endpoints for face detection, verification, and object classification.
    *   `yolov8n.onnx`: Pre-trained lightweight YOLOv8 network for fast object inference.
    *   `requirements.txt`: Python package dependencies (onnxruntime, fastapi, uvicorn, opencv-python-headless).

### 7. 🔌 Proctoring Service (`proctoring-service`)
*   **Technology**: Node.js, Express, Socket.io, TypeScript.
*   **Purpose**: A WebSocket service that handles persistent connections from the student's browser. It streams tab-switching, fullscreen exits, and coordinates frame-by-frame transmission to the `ai-service`.

### 8. 📨 Notification Service (`notification-service`)
*   **Technology**: Node.js, TypeScript, BullMQ, Redis, nodemailer.
*   **Purpose**: An event-driven background service that processes email jobs (e.g. registration confirmations, OTPs, test score notifications) queued in Redis via BullMQ.

---

## ⚙️ Local Development

To run the entire suite of services locally:

1.  **Prerequisites**: Ensure you have Docker, Docker Compose, Node.js (v18+), and Python (v3.11+) installed.
2.  **Environment Setup**: Copy `.env.example` in the root (and in individual service folders) to `.env` and fill in local database, Redis, and SMTP settings.
3.  **Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    This spins up local instances of PostgreSQL, Redis, and all microservices.

---

## 🐳 Containerization & CI/CD
*   **Dockerfiles**: Each service contains a multi-stage production-ready `Dockerfile` that minimizes image size and runs containers as non-root users for enhanced security.
*   **GitHub Workflows**: Code updates push to Azure Container Registry (ACR) automatically using GitHub Actions (`.github/workflows/build.yml`).
