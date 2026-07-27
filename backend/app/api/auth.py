from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=data.name, email=data.email, hashed_password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return Token(access_token=create_access_token(user.id), user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
