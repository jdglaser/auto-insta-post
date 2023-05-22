from contextlib import asynccontextmanager
from typing import AsyncIterator, TypedDict

import firebase_admin
import uvicorn
from firebase_admin import auth
from starlette import status
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles


class State(TypedDict):
    firebase_app: firebase_admin.App


async def update_token(request: Request) -> Response:
    return JSONResponse({"hello": "world"})


class CustomHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if "authorization" not in request.headers:
            return JSONResponse({"error": "missing authorization header"}, status_code=status.HTTP_403_FORBIDDEN)
        id_token = request.headers["authorization"]
        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception as e:
            e_name = type(e).__name__
            return JSONResponse({"error": f"Error verifying token: {e_name}"}, status_code=status.HTTP_403_FORBIDDEN)
        print(decoded_token)
        if not decoded_token:
            return JSONResponse(
                {"error": "not authorized"},
                status_code=status.HTTP_403_FORBIDDEN,
                media_type="",
                headers={"foo": "bar"},
            )
        response = await call_next(request)
        return response


@asynccontextmanager
async def lifespan(app: Starlette) -> AsyncIterator[State]:
    cred = firebase_admin.credentials.Certificate("./secret_key.json")
    firebase_app = firebase_admin.initialize_app(cred)
    app_state: State = {"firebase_app": firebase_app}
    try:
        yield app_state
    finally:
        app_state["firebase_app"] = None


app = Starlette(
    debug=True,
    middleware=[Middleware(CustomHeaderMiddleware)],
    routes=[
        Mount(
            "/api",
            routes=[Route("/update-token", update_token, methods=["POST"])],
        ),
        Mount("/", app=StaticFiles(directory="./static", html=True)),
    ],
    lifespan=lifespan,
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
