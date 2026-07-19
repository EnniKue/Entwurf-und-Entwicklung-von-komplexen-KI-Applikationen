export type TraceEvent = {
  event: string;
  data: any;
};

export const sendMessage = async (
  message: string
) => {

const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 30000);

  try {

    const response = await fetch(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {

      throw new Error(
        `HTTP_${response.status}`
      );

    }

    clearTimeout(timeout);

  } catch (error: any) {

    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    throw new Error("BACKEND_UNREACHABLE");

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