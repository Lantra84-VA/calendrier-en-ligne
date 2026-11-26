"""The versioned API surface.

Requests reaching this app have already been authenticated by the gateway, and the calendar is a
single shared space, so the group declares no additional dependencies: ``()`` is the declaration.
"""

from fastapi import params

segment = "v1"

dependencies: tuple[params.Depends, ...] = ()
