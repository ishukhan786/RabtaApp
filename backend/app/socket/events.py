import socketio

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


@sio.event
async def connect(sid, environ, auth):
    await sio.emit("connected", {"sid": sid}, to=sid)


@sio.event
async def send_message(sid, data):
    await sio.emit("new_message", data)


@sio.event
async def disconnect(sid):
    print(f"Socket disconnected: {sid}")
