from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    username: str
    security_answer: str
    new_password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
