type Props = {
  onSend: (message: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  return (
    <input
      type="text"
      placeholder="Nachricht eingeben..."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSend(e.currentTarget.value);
          e.currentTarget.value = "";
        }
      }}
    />
  );
}