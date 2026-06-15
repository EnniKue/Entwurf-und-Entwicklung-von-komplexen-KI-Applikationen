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
          height: "12px",
          backgroundColor: "#e5e7eb",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#4f46e5",
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