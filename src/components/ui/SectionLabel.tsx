export default function SectionLabel({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return <p className="eyebrow section-label">{dot && <span className="status-dot" aria-hidden="true" />}{children}</p>;
}
