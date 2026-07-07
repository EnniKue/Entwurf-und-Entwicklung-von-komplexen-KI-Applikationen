type Props = {
  progress: number;
};

export default function ProgressBar({
  progress,
}: Props) {
  return (
    <div
      style={{
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "#eef2ff",
          borderRadius: "999px",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#60a5fa",

              borderRadius: "999px",

              boxShadow:
                  "0 0 10px rgba(96,165,250,0.35)",

              transition: "width 0.3s ease",
          }}
        />
      </div>

      {progress > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "14px",
          }}
        >
          {progress} %
        </div>
      )}
    </div>
  );
}