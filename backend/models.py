from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum


class ProcessType(str, enum.Enum):
    asylum = "asylum"
    visa = "visa"
    green_card = "green_card"
    naturalization = "naturalization"
    student_visa = "student_visa"
    other = "other"


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(30), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    process_type = Column(Enum(ProcessType), nullable=False)
    description = Column(Text, nullable=True)
    preferred_language = Column(String(10), default="en")
    status = Column(String(50), default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
