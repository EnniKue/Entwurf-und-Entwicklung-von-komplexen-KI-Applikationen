import asyncio
import json

clients = []

async def register_client():

    queue = asyncio.Queue()

    clients.append(queue)

    print("Client verbunden:", len(clients))

    return queue


def unregister_client(queue):

    if queue in clients:
        clients.remove(queue)

    print("Client getrennt:", len(clients))


async def send_event(
    event: str,
    data=None,
):

    payload = {
        "event": event,
        "data": data,
    }
    
    for queue in clients:
        await queue.put(payload)


async def send_finished(
    response: str,
    route: str,
    source: str,
):

    await send_event(
        "finished",
        {
            "response": response,
            "route": route,
            "source": source,
        },
    )