from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
import models
from database import Base, engine, get_db
from auth import create_token, verify_token, authenticate_admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Immigration Law Intake API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------

class ClientCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    country_of_origin: Optional[str] = None
    process_type: models.ProcessType
    description: Optional[str] = None
    preferred_language: str = "en"


class ClientOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    country_of_origin: Optional[str]
    process_type: models.ProcessType
    description: Optional[str]
    preferred_language: str
    status: str
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdminNoteUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Auth ----------

@app.post("/api/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    if not authenticate_admin(data.username, data.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_token(data.username)
    return LoginResponse(access_token=token)


# ---------- Public: client registration ----------

@app.post("/api/clients", response_model=ClientOut, status_code=201)
def register_client(data: ClientCreate, db: Session = Depends(get_db)):
    client = models.Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


# ---------- Protected: attorney access ----------

@app.get("/api/clients", response_model=List[ClientOut])
def list_clients(
    process_type: Optional[models.ProcessType] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: str = Depends(verify_token),
):
    query = db.query(models.Client)
    if process_type:
        query = query.filter(models.Client.process_type == process_type)
    if status:
        query = query.filter(models.Client.status == status)
    if search:
        term = f"%{search}%"
        query = query.filter(
            models.Client.first_name.ilike(term)
            | models.Client.last_name.ilike(term)
            | models.Client.email.ilike(term)
        )
    return query.order_by(models.Client.created_at.desc()).all()


@app.get("/api/clients/{client_id}", response_model=ClientOut)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(verify_token),
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@app.patch("/api/clients/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int,
    data: AdminNoteUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_token),
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if data.status is not None:
        client.status = data.status
    if data.notes is not None:
        client.notes = data.notes
    db.commit()
    db.refresh(client)
    return client


@app.get("/api/health")
def health():
    return {"status": "ok"}
