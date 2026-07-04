export type TraceEvent = {
  event: string;
  data: any;
};

export const sendMessage = async (
  message: string
) => {

  const response = await fetch(
    "/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    }
  );

  if (!response.ok) {

    throw new Error(
      `HTTP_${response.status}`
    );

  }

};

export const connectToTraceStream = (
  onEvent: (payload: TraceEvent) => void
): Promise<EventSource> => {

  return new Promise((resolve) => {

    const eventSource = new EventSource("/api/chat/stream");

    eventSource.onopen = () => {
     
      resolve(eventSource);

    };

    eventSource.onmessage = (event) => {

      const payload: TraceEvent =
        JSON.parse(event.data);
    
      onEvent(payload);

    };

    eventSource.onerror = (error) => {

      console.error("SSE Fehler", error);

      eventSource.close();

    };

  });

};