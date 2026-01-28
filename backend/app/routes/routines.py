from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db, Routine, User
from app.models import Routine, User
from app.schemas import RoutineCreate, RoutineResponse, RoutineUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/routines", tags=["Routines"])


@router.post("/", response_model=RoutineResponse, status_code=status.HTTP_201_CREATED)
def create_routine(
    routine: RoutineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new yoga routine
    """
    db_routine = Routine(
        user_id=current_user.id,
        title=routine.title,
        goal=routine.goal,
        description=routine.description,
        yogasana_ids=routine.yogasana_ids,
        duration_minutes=routine.duration_minutes
    )
    
    db.add(db_routine)
    db.commit()
    db.refresh(db_routine)
    
    return db_routine


@router.get("/", response_model=List[RoutineResponse])
def get_routines(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all routines for current user
    """
    routines = db.query(Routine).filter(
        Routine.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return routines


@router.get("/{routine_id}", response_model=RoutineResponse)
def get_routine(
    routine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific routine by ID
    """
    routine = db.query(Routine).filter(
        (Routine.id == routine_id) & (Routine.user_id == current_user.id)
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    return routine


@router.put("/{routine_id}", response_model=RoutineResponse)
def update_routine(
    routine_id: int,
    routine_update: RoutineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a routine
    """
    routine = db.query(Routine).filter(
        (Routine.id == routine_id) & (Routine.user_id == current_user.id)
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    # Update fields
    update_data = routine_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(routine, field, value)
    
    db.commit()
    db.refresh(routine)
    
    return routine


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routine(
    routine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a routine
    """
    routine = db.query(Routine).filter(
        (Routine.id == routine_id) & (Routine.user_id == current_user.id)
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    db.delete(routine)
    db.commit()
    
    return None


@router.post("/{routine_id}/activate")
def activate_routine(
    routine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Activate a routine (set as current practice routine)
    """
    routine = db.query(Routine).filter(
        (Routine.id == routine_id) & (Routine.user_id == current_user.id)
    ).first()
    
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found"
        )
    
    # Deactivate all other routines for this user
    db.query(Routine).filter(
        (Routine.user_id == current_user.id) & (Routine.is_active == True)
    ).update({"is_active": False})
    
    # Activate this routine
    routine.is_active = True
    db.commit()
    db.refresh(routine)
    
    return {"message": "Routine activated successfully", "routine": routine}
