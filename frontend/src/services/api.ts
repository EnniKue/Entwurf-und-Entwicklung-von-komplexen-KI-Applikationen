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