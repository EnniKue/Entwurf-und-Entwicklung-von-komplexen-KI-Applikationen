import asyncio

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


async def send_event(event: str):

    print("Sende Event:", event)
    print("Clients:", len(clients))

    for queue in clients:
        await queue.put(event)