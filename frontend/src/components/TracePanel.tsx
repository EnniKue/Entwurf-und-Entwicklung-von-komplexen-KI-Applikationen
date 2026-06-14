type Props = {
  traces: string[];
};

export default function TracePanel({
  traces,
}: Props) {
  return (
    <div>
      <h3>Trace</h3>

      {traces.map((trace, index) => (
        <div key={index}>
          {trace}
        </div>
      ))}
    </div>
  );
}