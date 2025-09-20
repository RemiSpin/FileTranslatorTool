# FileTranslatorTool

A full-stack app to translate uploaded documents and manage user/team history.

- Frontend: React (Create React App) on http://localhost:3000
- API: Flask on http://localhost:5000
- Converter: Node/Express on http://localhost:3001 (uses pandoc for HTML→DOCX)
- DB: MySQL (schema in `team_project.sql`)

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- MySQL (XAMPP, MAMP, local server, or container)
- Pandoc (required for DOCX conversion)
- Open ports: 3000, 3001, 5000

## 1) Database setup (XAMPP or local MySQL)

1. Start MySQL in XAMPP (or your MySQL service).
2. Create database `team_project`.
3. Import `team_project.sql` into that database (via phpMyAdmin or mysql CLI).
4. Default connection in `database.py` is:
   - `mysql://root@localhost:3306/team_project` (root with no password)
   - If your MySQL has a password or different user/host, update `db_url` in `database.py` accordingly.

## 2) Python API (Flask)

From the project root:

```zsh
# Start API
python app.py
```

The API will run on http://localhost:5000.

## 3) Node converter (Express + pandoc)

This service converts HTML to DOCX with pandoc for .docx downloads.

```zsh
# Install Node dependencies (once)
npm install

# Start the converter server
node app.js
```

The converter runs on http://localhost:3001.

## 4) Frontend (React)

In another terminal, from the project root:

```zsh
npm start
```

CRA dev server runs on http://localhost:3000.
