# 🚀 Polyglot Microservices Orchestration

A production-grade, distributed system demonstrating high-availability patterns, cross-service communication, and multi-layered caching. This project serves as a comprehensive showcase of **Cloud Architecture**, **DevOps Engineering**, and **Backend System Design**.

![alt text](https://github.com/dev126712/microservices-app/blob/2f4cb46a52652ce43d147209045021f42ad8cb9f/Untitled%20Diagram.drawio%20(5).png)

|----|----|----|
Service|Initiates Talk To...|Purpose|
Frontend| (Nginx),Order Service & Product Service| To fetch data to show the User.|
Order| Service,Product Service|To verify an item exists before buying.|
Order| Service,Notification Service|To trigger the success message printout.|
Order| Service,PostgreSQL|To save the transaction permanently.|
Product| Service,Redis| To get or save product details quickly.|


## 🏗 System Architecture

The application is built using a "Polyglot" approach, selecting the best runtime for each specific task. All services are containerized and orchestrated via a unified network.

- **API Gateway (Nginx):** Acts as the entry point and reverse proxy, routing traffic to backend services based on URI patterns.
- **Product Service (Node.js + Redis):** Manages inventory using a **Cache-Aside pattern**. It utilizes Redis Hashes for persistence and String keys with TTL for fast-access caching.
- **Order Service (Python/Flask + PostgreSQL):** The transactional core. It performs cross-service validation with the Product Service before persisting orders to a relational database.
- **Notification Service (Go):** A high-concurrency worker that processes real-time alerts for the system.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Languages** | Python 3.11, Go 1.21, Node.js 20 |
| **Databases** | PostgreSQL 15, Redis 7 (Alpine) |
| **Infrastructure** | Docker, Docker Compose, Nginx |
| **Communication** | RESTful APIs (JSON), Internal Docker DNS |

## ⛓️ CI/CD & DevSecOps Pipeline
The project includes a robust automated pipeline using **GitHub Actions**, ensuring that every change is tested and secured before deployment.

- **Automated Builds:** Multi-architecture Docker builds for all 4 services.
- **SCA (Software Composition Analysis):** Uses **Trivy** to audit open-source dependencies for vulnerabilities.
- **SAST (Static Application Security Testing):** Uses **Semgrep** to find "code smells" and hardcoded credentials.
- **Container Hardening:** Post-build image scanning to ensure only "Zero-Critical-Vulnerability" images are pushed to Docker Hub.

## 🚢 Kubernetes Migration Path
Because the CI/CD pipeline already pushes versioned images to a public registry, this stack is ready for K8s:
1. **Images:** Pulled from `docker.io/your-user/micro-service:latest`.
2. **Configuration:** Environment variables are ready to be mapped to K8s `ConfigMaps`.
3. **Resilience:** Existing retry logic handles Pod restarts and scheduling delays.

## 🌟 Key Engineering Features

### 1. Resilient Service Discovery & Self-Healing
One of the primary challenges in container orchestration is the "Startup Race Condition." I implemented an **Exponential Backoff Retry Logic** in the Python service. This ensures the service doesn't crash if the PostgreSQL database is still initializing, allowing the system to self-heal during deployment.

### 2. Advanced Multi-Layer Caching
To reduce database overhead and latency, the system implements a dual-layer Redis strategy:
- **Persistence Layer:** Redis Hashes (`hSet`) store the "Source of Truth" for products.
- **Performance Layer:** Individual product lookups are cached as Strings with a **60-second TTL**, significantly speeding up repeat requests.
- **Consistency:** Implementation of cache-invalidation logic on `PUT` and `DELETE` operations.

### 3. Distributed Transactions (Sync Communication)
The system demonstrates a synchronous request-response flow across three different runtimes:
1. **Frontend** posts to the **Python API**.
2. **Python** validates the product ID via the **Node.js API**.
3. Upon validation, **Python** persists the order and triggers the **Go worker**.

## 🚀 Deployment Guide

### Prerequisites
- Docker & Docker Compose installed.

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/microservices-orchestration.git](https://github.com/your-username/microservices-orchestration.git)
   cd microservices-orchestration
