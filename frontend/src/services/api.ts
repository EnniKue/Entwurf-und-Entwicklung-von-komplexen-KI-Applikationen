export const sendMessage = async (message: string) => {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  let response;

  try {

    response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
      signal: controller.signal,
    });

  } catch (error: any) {

    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    throw error;
  }

  clearTimeout(timeout);

  console.log("Status:", response.status);

  // Backend oder Proxyfehler
  if (!response.ok) {

    throw new Error(
      `HTTP_${response.status}`
    );

  }

  const text = await response.text();

  console.log("RAW RESPONSE:");
  console.log(text);

  if (!text) {

    throw new Error("EMPTY_RESPONSE");

  }

  return JSON.parse(text);

};