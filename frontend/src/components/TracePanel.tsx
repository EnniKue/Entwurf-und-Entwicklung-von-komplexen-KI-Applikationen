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

        const isError =
            trace.includes("Fehler") ||
            trace.includes("nicht geladen") ||
            trace.includes("fehlgeschlagen");

        const isSensitive =
            trace.includes("Sensible Anfrage") ||
            trace.includes("Antwort aus");

        const isGuardrail =
            trace.includes("Guardrail");

        let icon = "✓";
        let color = "#16a34a";

        if (isSensitive) {
            icon = "⚠";
            color = "#d97706";
        }

        if (isGuardrail) {
            icon = "❌";
            color = "#dc2626";
        }

        if (isError) {
            icon = "❌";
            color = "#dc2626";
        }

        return (
            <div
            key={index}
            style={{
                marginBottom: "8px",
                color,
            }}
            >
            <span
                style={{
                    color: isSensitive
                    ? "#f59e0b"
                    : isError
                    ? "#dc2626"
                    : "#16a34a",

                    fontWeight: "bold",
                    marginRight: "6px",
                }}
                >
                {icon}
                </span>

            {trace}
            </div>
        );
        })}
    </div>
  );
}