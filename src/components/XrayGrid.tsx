/** The 12-column construction grid drawn inside an X-ray layer. */
export function XrayGrid() {
  return (
    <div className="xray-grid">
      <div>
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </div>
  );
}
