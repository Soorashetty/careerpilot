from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User, Notification
from app.schemas.schemas import NotificationOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50).all()

@router.patch("/{notif_id}/read", response_model=NotificationOut)
def mark_read(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if n:
        n.read = True
        db.commit()
        db.refresh(n)
    return NotificationOut.model_validate(n)

@router.patch("/read-all", status_code=204)
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read is False).update({"read": True})
    db.commit()
