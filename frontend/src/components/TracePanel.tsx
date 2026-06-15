type Props = {
  traces: string[];
};

export default function TracePanel({
  traces,
}: Props) {
  return (
    <div>
      <h3
        style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "20px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "10px",
        }}
    >
        Aktivitätsverlauf
    </h3>

      {traces.map((trace, index) => {
  const isError = trace.includes("Fehler");

  return (
    <div
      key={index}
      style={{
        marginBottom: "8px",
        color: isError ? "#dc2626" : "#111827",
      }}
    >
      <span
        style={{
          color: isError ? "#dc2626" : "#16a34a",
          fontWeight: "bold",
          marginRight: "6px",
        }}
      >
        {isError ? "✖" : "✓"}
      </span>

      {trace}
    </div>
  );
})}
    </div>
  );
}