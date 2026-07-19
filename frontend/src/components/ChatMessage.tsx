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
  route === "llm_error" ||
  text.includes("Backend derzeit nicht erreichbar") ||
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
        marginBottom: "18px",
      }}
    >
      
      <div
        style={{
          maxWidth: "68%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser
            ? "flex-end"
            : "flex-start",
        }}
      >

      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "6px",
          fontWeight: 600,
        }}
      >
        {isUser ? "Du" : "Nova"}
      </div>        

      <div
        style={{
          padding: "18px 22px",
          borderRadius: "20px",
          backgroundColor: isUser
            ? "#7cc4ff"
            : "#f8fafc",
          border: isUser
            ? "1px solid rgba(255,255,255,0.35)"
            : "1px solid rgba(0,0,0,0.05)",
          fontWeight: isUser ? 500 : 400,
          boxShadow: "0 3px 10px rgba(0,0,0,0.10)",       
          lineHeight: "1.6",
          fontSize: "15px",
          transition: "all 0.2s ease",
          color: isError
            ? "#b91c1c"
            : "#111827",
        }}
      >
        
        <div
          style={{
            marginTop: "0px",
            lineHeight: "1.7",

            color: isError
                ? "#dc2626"
                : "#111827",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  </div> 
  );
}