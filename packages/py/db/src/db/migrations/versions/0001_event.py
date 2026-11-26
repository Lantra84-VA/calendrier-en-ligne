"""Create the ``event`` table: the calendar feature's baseline.

Revision ID: 0001_event
Revises:
Create Date: 2026-01-01

"""
from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

revision: str = "0001_event"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = "calendrier"
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "event",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=200), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(length=4000), nullable=True),
        sa.Column("category", sqlmodel.sql.sqltypes.AutoString(length=40), nullable=False),
        sa.Column("color", sqlmodel.sql.sqltypes.AutoString(length=9), nullable=False),
        sa.Column("all_day", sa.Boolean(), nullable=False),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("event")
