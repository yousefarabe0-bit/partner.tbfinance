export const clients = [
  { id: '1', name: 'Ana Mendes', email: 'ana@email.com', initials: 'AM', avatarColor: '#E8440A', date: '12/03/2025', contractValue: 'R$ 2.400', commission: 'R$ 168/mês', status: 'Pago' },
  { id: '2', name: 'Carlos Rocha', email: 'carlos@email.com', initials: 'CR', avatarColor: '#6B7280', date: '20/04/2025', contractValue: 'R$ 3.600', commission: 'R$ 252/mês', status: 'Não Pago' },
  { id: '3', name: 'Fernanda Santos', email: 'fer@email.com', initials: 'FS', avatarColor: '#111111', date: '05/02/2025', contractValue: 'R$ 1.800', commission: 'R$ 126/mês', status: 'Inadimplente' },
  { id: '4', name: 'Paulo Oliveira', email: 'paulo@email.com', initials: 'PO', avatarColor: '#E8440A', date: '18/05/2025', contractValue: 'R$ 2.400', commission: 'R$ 168/mês', status: 'Pago' },
  { id: '5', name: 'Juliana Ferreira', email: 'ju@email.com', initials: 'JF', avatarColor: '#6B7280', date: '30/06/2025', contractValue: 'R$ 1.800', commission: 'R$ 126/mês', status: 'Pago' },
];

export const history = [
  { month: 'Setembro/2025', date: '15/09/2025', value: 'R$ 1.848', clients: '9 de 12', status: 'Programado' },
  { month: 'Agosto/2025', date: '15/08/2025', value: 'R$ 1.680', clients: '10 de 12', status: 'Recebido' },
  { month: 'Julho/2025', date: '15/07/2025', value: 'R$ 1.512', clients: '9 de 11', status: 'Recebido' },
  { month: 'Junho/2025', date: '15/06/2025', value: 'R$ 1.176', clients: '7 de 10', status: 'Recebido' },
];

export const partners = [
  { id: '1', name: 'Ricardo Silva', email: 'ricardo@email.com', initials: 'RS', avatarColor: '#E8440A', clients: 12, totalContracts: 'R$ 26.400', commission: 'R$ 1.848', status: 'Ativo' },
  { id: '2', name: 'Juliana Costa', email: 'juliana@email.com', initials: 'JC', avatarColor: '#6B7280', clients: 8, totalContracts: 'R$ 19.200', commission: 'R$ 1.344', status: 'Ativo' },
  { id: '3', name: 'Marcos Freitas', email: 'marcos@email.com', initials: 'MF', avatarColor: '#111111', clients: 5, totalContracts: 'R$ 12.000', commission: 'R$ 840', status: 'Ativo' },
];

export const referrals = [
  { id: '1', name: 'Marina Lima', email: 'marina@email.com', initials: 'ML', avatarColor: '#E8440A', closings: 5, discount: '★ Parceiro!', lastReferred: 'Lívia Martins', status: 'Promover', highlight: true },
  { id: '2', name: 'Thiago Souza', email: 'thiago@email.com', initials: 'TS', avatarColor: '#6B7280', closings: 4, discount: '100% OFF', lastReferred: 'Beatriz Nunes', status: 'Ativo' },
  { id: '3', name: 'Renata Oliveira', email: 'renata@email.com', initials: 'RO', avatarColor: '#111111', closings: 2, discount: '50% OFF', lastReferred: 'Diego Campos', status: 'Ativo' },
  { id: '4', name: 'Felipe Pinto', email: 'felipe@email.com', initials: 'FP', avatarColor: '#E8440A', closings: 1, discount: '25% OFF', lastReferred: 'Carla Ramos', status: 'Ativo' },
];

export const adminPaymentClients = [
  { id: '1', name: 'Ana Mendes', initials: 'AM', avatarColor: '#E8440A', partner: 'Ricardo Silva', status: 'Pago' },
  { id: '2', name: 'Carlos Rocha', initials: 'CR', avatarColor: '#6B7280', partner: 'Ricardo Silva', status: 'Não Pago' },
  { id: '3', name: 'Fernanda Santos', initials: 'FS', avatarColor: '#111111', partner: 'Ricardo Silva', status: 'Inadimplente' },
  { id: '4', name: 'Paulo Oliveira', initials: 'PO', avatarColor: '#E8440A', partner: 'Ricardo Silva', status: 'Pago' },
  { id: '5', name: 'Juliana Ferreira', initials: 'JF', avatarColor: '#6B7280', partner: 'Juliana Costa', status: 'Pago' },
];

export const commissionReport = [
  { id: '1', name: 'Ricardo Silva', initials: 'RS', avatarColor: '#E8440A', contracts: 'R$ 26.400', commission: 'R$ 1.848' },
  { id: '2', name: 'Juliana Costa', initials: 'JC', avatarColor: '#6B7280', contracts: 'R$ 19.200', commission: 'R$ 1.344' },
  { id: '3', name: 'Marcos Freitas', initials: 'MF', avatarColor: '#111111', contracts: 'R$ 12.000', commission: 'R$ 840' },
];
