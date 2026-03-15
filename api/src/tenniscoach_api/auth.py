import os

from fastapi import Header, HTTPException


def verify_token(authorization: str = Header(...)) -> None:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ", 1)[1]
    if token != os.environ["API_TOKEN"]:
        raise HTTPException(status_code=401, detail="Invalid token")
