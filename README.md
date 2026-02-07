## Overview
The **JS Extractor** is a tool designed to scan JavaScript files and text for sensitive information like API keys, secrets, URLs, and paths. 

## Getting Started

### Option 1: Docker (Recommended)
1. **Prerequisites**: Install Docker and Docker Compose.
2. **Start**:
   Open a terminal in the project root and run:
   ```bash
   docker-compose up --build
   ```
   > App runs on `http://localhost:5173`  
   > Backend API on `http://localhost:3001`

### Option 2: Manual Setup
1. **Prerequisites**: Node.js installed on your system.
2. **Start the Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```
3. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
