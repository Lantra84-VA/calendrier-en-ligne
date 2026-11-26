"""Reads and writes the ``event`` table."""

from datetime import UTC, datetime

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.events import Event


async def create(session: AsyncSession, event: Event) -> Event:
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


async def get(session: AsyncSession, event_id: int) -> Event | None:
    return await session.get(Event, event_id)


async def list_between(session: AsyncSession, start: datetime, end: datetime) -> list[Event]:
    """Events overlapping ``[start, end)``, soonest first."""
    statement = (
        select(Event)
        .where(
            Event.start_at < end,
            or_(Event.end_at.is_(None), Event.end_at >= start),
        )
        .order_by(Event.start_at, Event.id)
    )
    return list((await session.execute(statement)).scalars().all())


async def list_all(session: AsyncSession) -> list[Event]:
    statement = select(Event).order_by(Event.start_at, Event.id)
    return list((await session.execute(statement)).scalars().all())


async def update(session: AsyncSession, event: Event) -> Event:
    event.updated_at = datetime.now(UTC)
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


async def delete(session: AsyncSession, event: Event) -> None:
    await session.delete(event)
    await session.commit()
