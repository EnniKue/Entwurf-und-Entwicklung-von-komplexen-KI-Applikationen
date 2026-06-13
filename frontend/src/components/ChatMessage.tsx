type Props = {
  text: string;
  sender: "user" | "assistant";
};

export default function ChatMessage({
  text,
  sender,
}: Props) {
  return (
    <div>
      <strong>
        {sender === "user"
          ? "Du:"
          : "Assistent:"}
      </strong>
      {" "}
      {text}
    </div>
  );
}