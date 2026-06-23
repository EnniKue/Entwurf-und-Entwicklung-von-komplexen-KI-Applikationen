export const sendMessage = async (message: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  console.log("Status:", response.status);

  const text = await response.text();

  console.log("RAW RESPONSE:");
  console.log(text);

  return JSON.parse(text);
};

export const connectToTraceStream = (
  onEvent: (event: string) => void
) => {
  const eventSource = new EventSource(
    "http://127.0.0.1:8000/api/chat/stream"
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    onEvent(data.event);
  };

  return eventSource;
};