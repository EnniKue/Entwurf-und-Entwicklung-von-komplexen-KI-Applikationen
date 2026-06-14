type Props = {
  text: string;
  sender: "user" | "assistant";
};

export default function ChatMessage({
  text,
  sender,
}: Props) {
  const isUser = sender === "user";

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
            : "black",
        }}
      >
        <strong>
          {isUser ? "Du:" : "Assistent:"}
        </strong>

        <div
          style={{
            marginTop: "5px",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}