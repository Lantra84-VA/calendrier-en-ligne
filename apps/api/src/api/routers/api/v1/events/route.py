"""Calendar event routes: the collection at this path, one event under ``[event_id].py``."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from db.accessors import events as events_accessor
from db.engine import get_session_maker
from db.models.events import Event

router = APIRouter()


async def get_session() -> AsyncSession:
    async with get_session_maker()() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    category: str = Field(default="autre", max_length=40)
    color: str = Field(default="#3b82f6", max_length=9, pattern=r"^#[0-9a-fA-F]{6}$")
    all_day: bool = False
    start_at: datetime
    end_at: datetime | None = None


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    category: str | None = Field(default=None, max_length=40)
    color: str | None = Field(default=None, max_length=9, pattern=r"^#[0-9a-fA-F]{6}$")
    all_day: bool | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None


class EventRead(EventCreate):
    id: int
    created_at: datetime
    updated_at: datetime


async def require_event(session: AsyncSession, event_id: int) -> Event:
    event = await events_accessor.get(session, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    return event


@router.get("", operation_id="list_events", summary="List events overlapping an optional window")
async def list_events(
    session: SessionDep,
    start: Annotated[datetime | None, Query(alias="from")] = None,
    end: Annotated[datetime | None, Query(alias="to")] = None,
) -> list[EventRead]:
    if start is not None and end is not None:
        events = await events_accessor.list_between(session, start, end)
    else:
        events = await events_accessor.list_all(session)
    return [EventRead(**event.model_dump()) for event in events]


@router.post("", operation_id="create_event", summary="Create an event", status_code=201)
async def create_event(session: SessionDep, payload: EventCreate) -> EventRead:
    event = await events_accessor.create(session, Event(**payload.model_dump()))
    return EventRead(**event.model_dump())


@router.get("/{event_id}", operation_id="get_event", summary="Read one event")
async def get_event(session: SessionDep, event_id: int) -> EventRead:
    event = await require_event(session, event_id)
    return EventRead(**event.model_dump())


@router.patch("/{event_id}", operation_id="update_event", summary="Update an event")
async def update_event(session: SessionDep, event_id: int, payload: EventUpdate) -> EventRead:
    event = await require_event(session, event_id)
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(event, field, value)
    event = await events_accessor.update(session, event)
    return EventRead(**event.model_dump())


@router.delete("/{event_id}", operation_id="delete_event", summary="Delete an event", status_code=204)
async def delete_event(session: SessionDep, event_id: int) -> Response:
    event = await require_event(session, event_id)
    await events_accessor.delete(session, event)
    return Response(status_code=204)
