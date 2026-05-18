from pydantic import BaseModel, Field


class GroupCreate(BaseModel):
    name: str
    description: str | None = None
    member_ids: list[int] = Field(default_factory=list)
