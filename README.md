# Flyn - An Intelligent Receipt Processing Agent

> An AI-powered application that automatically extracts data from receipt images and populates a Google Sheet, turning any spreadsheet into an intelligent budgeting canvas.

![Flyn Dashboard](https://i.imgur.com/B9O0KzN.png)

---

## About The Project

Flyn is a full-stack application designed to streamline personal and small business expense tracking. Users can connect their existing Google Sheets or create new ones from templates, transforming them into "Canvases."

By simply uploading a receipt, an advanced AI agent—built with **LangGraph** and powered by **Google's Gemini model**—analyzes the document, extracts line items, and intelligently appends the data to the correct columns in the user's spreadsheet. The agent is made context-aware through an AI-powered schema analysis that understands the sheet's structure, including custom categories and dropdown menus.

### Key Features

* **AI-Powered Receipt Parsing**: Extracts merchant, date, line items, and totals from an image.
* **Google Sheets Integration**: Directly reads from and writes to the user's Google Sheets.
* **Dynamic "Canvas" System**: Any Google Sheet can become a smart canvas for data entry.
* **Smart Schema Caching**: An AI agent analyzes the spreadsheet structure once and caches a summary, making subsequent data entries faster and more accurate.
* **Interactive Chat Interface**: Users can interact with their budget data through a conversational UI.

---

## Built With

This project is a monorepo with a Python backend and a Next.js frontend.

**Backend:**
* [Python](https://www.python.org/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [LangChain](https://www.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraph/)
* [Google Gemini](https://ai.google.dev/)
* [Supabase](https://supabase.io/) (Auth & Database)
* [gspread-asyncio](https://gspread-asyncio.readthedocs.io/)

**Frontend:**
* [Next.js](https://nextjs.org/)
* [React](https://reactjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Supabase.js](https://supabase.com/docs/library/js/getting-started)
* [Google Picker API](https://developers.google.com/picker)

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

* **Node.js** (v18 or later)
* **Python** (v3.10 or later)
* **Git**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yonziii/Flyn-Project.git](https://github.com/yonziii/Flyn-Project.git)
    cd Flyn-Project
    ```

2.  **Backend Setup:**
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Create and activate a virtual environment:
        ```bash
        # For Mac/Linux
        python3 -m venv venv
        source venv/bin/activate

        # For Windows
        python -m venv venv
        .\venv\Scripts\activate
        ```
    * Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    * Create a `.env` file in the `backend` directory and add your secret keys. Use the `.env.example` as a template:
        ```env
        # backend/.env
        GOOGLE_API_KEY="AIzaSy..."
        GOOGLE_CLIENT_ID="..."
        GOOGLE_CLIENT_SECRET="..."
        
        SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
        SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

        FRONTEND_URL="http://localhost:3000"
        ```

3.  **Frontend Setup:**
    * Navigate to the frontend directory from the root:
        ```bash
        cd frontend
        ```
    * Install Node.js dependencies:
        ```bash
        npm install
        ```
    * Create a `.env.local` file in the `frontend` directory and add your public keys:
        ```env
        # frontend/.env.local
        NEXT_PUBLIC_SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
        NEXT_PUBLIC_GOOGLE_API_KEY="AIzaSy..."
        ```

---

## Usage

You need to run both the backend and frontend servers in separate terminals.

1.  **Run the Backend Server:**
    * From the `backend` directory:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`.

2.  **Run the Frontend Server:**
    * From the `frontend` directory:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.