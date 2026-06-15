type Props = {
  x: number;
  y: number;
  onCopy: () => void;
  onClearChat: () => void;
  onClearTrace: () => void;
};

export default function ContextMenu({
  x,
  y,
  onCopy,
  onClearChat,
  onClearTrace,
}: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        padding: "8px",
        zIndex: 1000,
        minWidth: "220px",
      }}
    >
      <div
        style={{ padding: "8px", cursor: "pointer" }}
        onClick={onCopy}
      >
       ⧉ Letzte Antwort kopieren
      </div>

      <div
        style={{ padding: "8px", cursor: "pointer" }}
        onClick={onClearChat}
      >
        🗑️ Chat löschen
      </div>

      <div
        style={{ padding: "8px", cursor: "pointer" }}
        onClick={onClearTrace}
      >
        ↺ Verlauf löschen
      </div>
    </div>
  );
}