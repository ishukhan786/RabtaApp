from fastapi import APIRouter

from app.schemas.user import ForgotPasswordRequest, LoginRequest, UserCreate

router = APIRouter()


@router.post("/register")
def register(payload: UserCreate):
    return {"message": "User registered", "user": payload}


@router.post("/login")
def login(payload: LoginRequest):
    return {"access_token": "demo-token", "token_type": "bearer", "username": payload.username}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    return {"message": "Password renewed", "username": payload.username}
