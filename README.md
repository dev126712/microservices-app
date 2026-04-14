# 🚀 Polyglot Microservices Orchestration

A production-grade, distributed system demonstrating high-availability patterns, cross-service communication, and multi-layered caching.

![System Architecture](https://github.com/dev126712/microservices-app/blob/e82b161ba4cf18907632932754d6df223b8bbb36/Untitled%20Diagram.drawio%20(6).png)

## 🏗 System Architecture

The application is built using a **Polyglot** approach, selecting the best runtime for each specific task. All services are containerized and orchestrated via a unified Docker network.

### Service Communication Matrix

| Service | Initiates Talk To... | Purpose |
| :--- | :--- | :--- |
| **Frontend (Nginx)** | Order & Product Services | Acts as a Reverse Proxy to fetch UI data (Orders, Inventory, Stats). |
| **Order Service** | Product Service | Performs a synchronous GET request to verify item existence before purchase. |
| **Order Service** | Notification Service | Triggers a POST request to the Go worker after an order is persisted. |
| **Order Service** | PostgreSQL | Acts as the sole owner of transactional order history. |
| **Product Service** | Redis | Manages inventory using a **Cache-Aside pattern** for high-speed access. |

## 🛡 DevSecOps & CI/CD Pipeline

Each service (Product, Order, Notification, and Frontend) is managed by an independent **GitHub Actions** workflow that enforces a "Security-First" deployment strategy:

- **SCA (Software Composition Analysis):** Uses **Trivy** to scan the filesystem for vulnerable open-source dependencies.
- **SAST (Static Application Security Testing):** Uses **Semgrep** to audit code for logic errors, "code smells," and hardcoded credentials.
- **Container Hardening:** Every Docker image undergoes a post-build scan. The pipeline is configured to fail (`exit-code: 1`) if **CRITICAL** vulnerabilities are detected in the OS layer.
- **Automated Versioning:** Images are pushed to Docker Hub with both a `latest` tag and a unique `SHA` tag for immutable deployments.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **API Gateway** | Nginx (Reverse Proxy) |
| **Product Service** | Node.js (Express) + Redis |
| **Order Service** | Python (Flask) + SQLAlchemy + PostgreSQL |
| **Notification Service** | Go (High-concurrency worker) |
| **Infrastructure** | Docker, Docker Compose, Internal DNS |

## 🌟 Key Engineering Features

### 1. Resilient Service Discovery
Implemented **Exponential Backoff Retry Logic** in the Python service. This ensures the system handles "startup race conditions" by waiting for the PostgreSQL database to initialize before accepting traffic.

### 2. Advanced Multi-Layer Caching
To reduce database overhead, the Product Service implements a dual-layer Redis strategy:
- **Persistence Layer:** Redis Hashes store the source of truth.
- **Performance Layer:** Individual lookups are cached as Strings with a **60-second TTL**.
- **Consistency:** Automatic cache invalidation on `PUT` and `DELETE` operations.

### 3. Distributed Orchestration
The system demonstrates a synchronous request-response flow across three different runtimes:
1. **Frontend** initiates a request via the Nginx proxy.
2. **Order Service (Python)** validates the product via **Product Service (Node.js)**.
3. **Order Service** commits to **Postgres** and pings **Notification Service (Go)**.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Deployment
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/microservices-orchestration.git](https://github.com/your-username/microservices-orchestration.git)
   cd microservices-orchestration
