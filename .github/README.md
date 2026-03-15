# Device Events Platform

A real-time platform for ingesting, processing and visualizing device events.

This project simulates medical or monitoring devices sending measurements such as heart rate or temperature. Events are stored, processed and displayed in a real-time dashboard.

The system demonstrates an event-driven architecture with real-time updates using WebSockets and Redis.

---

# Technologies Used

Backend
- Node.js
- NestJS
- TypeORM
- PostgreSQL
- Redis
- WebSockets

Frontend
- Next.js
- React
- TailwindCSS

Infrastructure
- Docker
- Docker Compose

---

# Features

- Event ingestion via API
- Storage of events in PostgreSQL
- Alert generation based on event values
- Real-time updates using Redis Pub/Sub and WebSockets
- Dashboard displaying:
  - recent events
  - active devices
  - alerts
  - device statistics

---
  # Project Structure
  device-events-platform
  ├── backend
  ├── frontend
  ├── docker
  └── README.md


---

# Running the Project

### Requirements

- Docker
- Docker Compose

---

### Start the system

Navigate to the docker folder and run:
docker compose up --build

This will start:

- PostgreSQL
- Redis
- Backend API
- Frontend dashboard

---

### Access the application

Frontend dashboard
http://localhost:3000

Backend API
http://localhost:3001


