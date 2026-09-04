const statusMap = {
  'Pago':         { bg: '#DCFCE7', text: '#16A34A' },
  'Não Pago':     { bg: '#FEF3C7', text: '#D97706' },
  'Inadimplente': { bg: '#FEE2E2', text: '#DC2626' },
  'Recebido':     { bg: '#DBEAFE', text: '#1D4ED8' },
  'Programado':   { bg: '#FEF3C7', text: '#D97706' },
  'Ativo':        { bg: '#DBEAFE', text: '#1D4ED8' },
  'Promover':     { bg: '#FEF3C7', text: '#D97706' },
  'A Receber':    { bg: '#FEF3C7', text: '#D97706' },
};

export default function StatusBadge({ status, style = {} }) {
  const s = statusMap[status] ?? { bg: '#F8F8F7', text: '#6B7280' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, background: s.bg, color: s.text,
      whiteSpace: 'nowrap', ...style,
    }}>
      {status}
    </span>
  );
}
