# 🚀 Project-5: Cloud-Native DevSecOps & EKS Architecture

> **Continuous Integration, Security Hardening (GHAS/SAST/SCA), and Automated Deployment to Amazon EKS & Multi-Cloud.**

---

## 📌 Executive Summary

| Parameter | Specification |
| :--- | :--- |
| **Project Name** | **Python Flask Transaction & Digital Signing Service** |
| **Repository Root** | `https://github.com/guruhemanth/project-5` (Branch: `main`) |
| **Application Stack** | Python 3.11, Flask, SQLAlchemy, PostgreSQL, Xorkee Digital Signature API |
| **Primary Deployment Target** | **Amazon EKS** (`flask-2fa-eks` in region `ap-south-1`) |
| **Multi-Cloud Ready** | Microsoft Azure (OIDC Workload Identity, AKS, ACR) |
| **CI/CD Orchestration** | **GitHub Actions** (Enterprise Pipeline) & **Jenkins** (Declarative) |
| **Security Maturity** | **DevSecOps Level 3** (CodeQL, Bandit, pip-audit, Trivy, Secret Push Protection) |

---

## 🏗️ Architectural Evolution

This repository captures the evolutionary maturity of hosting a production web service from local development to cloud-native Kubernetes:

| Approach | Directory | Infrastructure Stack | Database Architecture | Key Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **Approach 1** | `python_flask_app/approach_1_local` | Local Workstation / WSL | Local SQLite / Postgres | Rapid developer prototyping and local pytest execution. |
| **Approach 2** | `python_flask_app/approach_2_ec2_and_RDS` | AWS EC2 (Compute) | Managed AWS RDS PostgreSQL | Decoupled compute from managed relational database tier. |
| **Approach 3** | `python_flask_app/approach_3_ec2` | AWS EC2 (Single VM) | Co-located Postgres on VM | Monolithic single-node cloud deployment. |
| **Approach 4 (Active)** | `python_flask_app/approach_4_eks` | **AWS EKS (Kubernetes)** | Containerized Stateful PostgreSQL | **Zero-downtime rolling updates, Horizontal Pod Autoscaling (HPA), and Terraform IaC.** |

---

## 🔄 CI/CD Pipeline Comparison

| Pipeline Attribute | Legacy Jenkins (`Jenkinsfile`) | Modern GitHub Actions (`.github/workflows/eks-ci-cd.yml`) |
| :--- | :--- | :--- |
| **Hosting Model** | Self-hosted Jenkins Controller / Worker node | Ephemeral GitHub-Hosted Cloud Runners (`ubuntu-latest`) |
| **Trigger Events** | Webhook / SCM Polling | Git `push`, `pull_request` (with path filtering), and manual `workflow_dispatch` |
| **Linting & Quality** | Flake8 syntax checks | Flake8 with automated inline GitHub annotations |
| **Automated Testing** | Pytest with in-memory SQLite isolation | Pytest with coverage XML artifact reporting |
| **Security Auditing** | Bandit + `pip-audit` | **Bandit + `pip-audit` + GitHub CodeQL (GHAS) + Trivy Container Scan** |
| **Container Build** | Docker CLI build & push | `docker/setup-buildx-action` + multi-tagging with Git SHA |
| **Target Deployment** | Local agent kubeconfig | **Passwordless OIDC** ➔ `kubectl rollout status` verification |

---

## 🛡️ DevSecOps & Security Tools Matrix

| Security Layer | Tool | Type | Detection Scope & Value |
| :--- | :--- | :--- | :--- |
| **Source Code (SAST)** | **Bandit** | AST Analysis | Flags Python security anti-patterns: `eval()`, `shell=True`, SQL string formatting, insecure random generators. |
| **Semantic SAST** | **GitHub CodeQL** | Taint / Data Flow | Deep data-flow analysis tracing untrusted user input from HTTP endpoints directly to internal sinks. |
| **Dependencies (SCA)** | **`pip-audit`** | Vulnerability Scan | Cross-references installed packages against PyPA and Google OSV databases for known CVEs. |
| **Container Security** | **Trivy** | Image Vulnerability | Scans container OS layers (Alpine/Debian CVEs) before pushing to Docker Hub; fails on `HIGH`/`CRITICAL`. |
| **Secrets & Credentials** | **GHAS Push Protection** | Pre-receive Hook | Rejects `git push` if AWS keys, database passwords, or private API tokens are detected in commit history. |

---

## 🔐 Cloud Identity & Authentication (Zero-Secret OIDC)

Instead of storing long-lived, high-risk credentials in CI secrets, authentication relies on short-lived OpenID Connect (OIDC) federated tokens:

| Cloud Platform | Authentication Standard | Identity Link / Subject | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **Amazon Web Services (AWS)** | `aws-actions/configure-aws-credentials` | `repo:guruhemanth/project-5:ref:refs/heads/main` | IAM Role + EKS Access Entry (`AmazonEKSClusterAdminPolicy`) |
| **Microsoft Azure** | `azure/login` (Workload Identity) | `repo:guruhemanth/project-5:ref:refs/heads/main` | Azure RBAC (`Contributor` / `AKS Cluster Admin`) |

---

## 📂 Core Configuration & Repository Layout

```text
project-5/
├── .github/
│   └── workflows/
│       └── eks-ci-cd.yml             # Root GitHub Actions Enterprise Pipeline (Active)
├── python_flask_app/
│   ├── approach_1_local/             # Local dev and testing setup
│   ├── approach_2_ec2_and_RDS/       # EC2 + RDS configuration
│   ├── approach_3_ec2/               # Standalone EC2 configuration
│   └── approach_4_eks/               # Cloud-native EKS configuration (Active)
│       ├── Dockerfile                # Production container packaging
│       ├── deployment.yaml           # Kubernetes Deployment & Service manifests
│       ├── postgres-deployment.yaml  # Kubernetes Postgres backend manifest
│       ├── Jenkinsfile               # Legacy Jenkins pipeline reference
│       ├── requirements.txt          # Production application dependencies
│       ├── server_xorkeesign.py      # Flask application entrypoint
│       └── terraform/                # Infrastructure as Code (VPC & EKS cluster)
└── PROJECT_SUMMARY.md                # Project architecture & tabulation summary
```

---

## 🚦 Verification & Execution Guide

### 1. Run Security Scans Locally:
```bash
# Code SAST Scan:
bandit -r python_flask_app/approach_4_eks -x python_flask_app/approach_4_eks/venv

# Dependency SCA Scan:
pip-audit -r python_flask_app/approach_4_eks/requirements.txt
```

### 2. Trigger the GitHub Actions CI/CD Pipeline:
```bash
git add .
git commit -m "feat(docs): add comprehensive project tabulation summary"
git push origin main
```
* Monitor execution under the **Actions** tab on GitHub:
  1. 🧪 **Test & Lint**
  2. 🛡️ **GHAS & Security Scan**
  3. 🐳 **Docker Build & Trivy Scan**
  4. 🚀 **Deploy to AWS EKS**
