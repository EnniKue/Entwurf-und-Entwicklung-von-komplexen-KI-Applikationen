type Props = {
  text: string;
  sender: "user" | "assistant";
  route?: string;
};

export default function ChatMessage({
  text,
  sender,
  route,
}: Props) {
  const isUser = sender === "user";

  const isSensitive =
    route === "sensitive";

  const isError =
  route === "guardrail" ||
  route === "sensitive" ||
  text.includes("Backend derzeit nicht erreichbar") ||
  text.includes("Sprachmodell aktuell nicht verfügbar") ||
  text.includes("Anfrage dauert zu lange") ||
  text.includes("Antwort konnte nicht verarbeitet werden") ||
  text.includes("Fehler");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser
          ? "flex-end"
          : "flex-start",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "10px",
          borderRadius: "12px",
          backgroundColor: isUser
            ? "#4f46e5"
            : "#e5e7eb",
          color: isUser
            ? "white"
            : isError
              ? "#b91c1c"
              : "black",
        }}
      >
        <strong
          style={{
            color: "black",
          }}
        >
          {isUser ? "Du:" : "Assistent:"}
        </strong>

        <div
          style={{
            marginTop: "5px",

            color: isError
              ? "#dc2626"
              : "inherit"
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}