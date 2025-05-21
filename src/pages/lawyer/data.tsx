// mockData.ts or mockData.js

export const mockClients = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-1234",
    address: "123 Main St, New York, NY",
    company: "Doe Legal LLC",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@smithlaw.com",
    phone: "+1-555-5678",
    address: "456 Oak Ave, Los Angeles, CA",
    company: "Smith & Associates",
  },
];

export const mockCases = [
  {
    id: 101,
    title: "Contract Dispute - Acme Corp",
    clientId: 1,
    status: "Open",
    openedDate: "2024-12-01",
    lastUpdated: "2025-05-10",
    description: "Dispute over contractual obligations with Acme Corp.",
  },
  {
    id: 1,
    title: "Property Litigation - Jane Smith",
    clientId: 2,
    status: "Closed",
    openedDate: "2023-06-15",
    lastUpdated: "2024-03-10",
    description: "Litigation regarding property boundary disagreement.",
  },
];

export const mockAppointments = [
  {
    id: 201,
    clientId: 1,
    caseId: 101,
    date: "2025-05-17T14:00:00Z",
    location: "Zoom",
    notes: "Follow-up on settlement offer",
  },
  {
    id: 1,
    clientId: 2,
    caseId: 102,
    date: "2025-05-18T09:30:00Z",
    location: "Office - Room 5B",
    notes: "Document review and final sign-off",
  },
];

export const mockInvoices = [
  {
    id: 301,
    clientId: 1,
    caseId: 101,
    amount: 2500,
    issueDate: "2025-05-01",
    dueDate: "2025-05-31",
    status: "Unpaid",
    description: "Legal services for contract dispute case",
  },
  {
    id: 1,
    clientId: 2,
    caseId: 102,
    amount: 1500,
    issueDate: "2025-04-15",
    dueDate: "2025-05-15",
    status: "Paid",
    description: "Final litigation support and filing fees",
  },
];
