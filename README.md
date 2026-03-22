# idomero webapp

Ez a webalkalmazás egy Python alapú backendből (FastAPI) és egy TypeScript alapú frontendből (React + Vite) áll.

## Fejlesztői környezet indítása

A projekt indításához a legegyszerűbb módszer a `start.bat` fájl futtatása, amely automatikusan elindítja a backend és a frontend fejlesztői szervereket is.

### Manuális indítás

Ha külön szeretnéd indítani a részeket:

#### Backend

1.  Navigálj a `backend` mappába.
2.  Aktiváld a Python virtuális környezetet: `env\Scripts\activate`
3.  Indítsd el a FastAPI szervert: `uvicorn app.main:app --reload --host 0.0.0.0`

#### Frontend

1.  Navigálj az `idomero-ui` mappába.
2.  Telepítsd a függőségeket (ha még nem tetted meg): `npm install`
3.  Indítsd el a Vite fejlesztői szervert: `npm run dev`