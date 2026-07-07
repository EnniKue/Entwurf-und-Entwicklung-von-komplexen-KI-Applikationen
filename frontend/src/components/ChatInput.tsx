import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
  loading: boolean;
};

export default function ChatInput({
  onSend,
  loading,
}: Props) {

  const [text, setText] = useState("");

  const send = () => {

    if (!text.trim()) return;

    onSend(text);

    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        marginTop: "20px",
        alignItems: "stretch",
      }}
    >
      <textarea
        value={text}
        placeholder="Nachricht eingeben..."
        rows={2}
        onChange={(e) =>
          setText(e.target.value)
        }
        onKeyDown={(e) => {

          if (
            e.key === "Enter" &&
            !e.shiftKey
          ) {
            e.preventDefault();
            send();
          }

        }}
        style={{
          flex: 1,

          resize: "vertical",

          padding: "16px",

          fontSize: "15px",

          fontFamily: "inherit",

          borderRadius: "16px",

          border: "1px solid #d1d5db",

          backgroundColor: "#f9fafb",

          color: "#111827",

          outline: "none",

          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",

          transition: "all 0.2s ease",
        }}
      />

      <button
        onClick={send}
        disabled={loading}
        style={{
          minWidth: "105px",

          padding: "0 24px",

          backgroundColor: loading
            ? "#9ca3af"
            : "#60a5fa",

          color: "#111827",

          border: "none",

          borderRadius: "16px",

          fontWeight: 600,

          fontSize: "15px",

          cursor: loading
            ? "not-allowed"
            : "pointer",

          opacity: loading ? 0.7 : 1,

          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",

          transition: "all 0.2s ease",

          alignSelf: "flex-end",
          height: "56px",
        }}
      >
        {loading ? "..." : "Senden"}
      </button>
    </div>
  );
}