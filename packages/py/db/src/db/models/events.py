"""The ``event`` table: one calendar event."""

from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(UTC)


class Event(SQLModel, table=True):
    __tablename__ = "event"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    category: str = Field(default="autre", max_length=40)
    color: str = Field(default="#3b82f6", max_length=9)
    all_day: bool = Field(default=False)
    start_at: datetime = Field(sa_type=DateTime(timezone=True))
    end_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=utcnow, sa_type=DateTime(timezone=True))
