import asyncio

event_queue = asyncio.Queue()


async def send_event(event: str):
    await event_queue.put(event)


async def get_event():
    return await event_queue.get()