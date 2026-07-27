from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Application
from app.schemas.schemas import ApplicationCreate, ApplicationUpdate, ApplicationOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("", response_model=list[ApplicationOut])
def list_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.applied_at.desc()).all()

@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app = Application(user_id=current_user.id, **data.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return ApplicationOut.model_validate(app)

@router.patch("/{app_id}", response_model=ApplicationOut)
def update_application(app_id: int, data: ApplicationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(app, k, v)
    db.commit()
    db.refresh(app)
    return ApplicationOut.model_validate(app)

@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
