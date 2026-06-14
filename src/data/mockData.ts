import { Client, Project, Invoice, TimeEntry, ProfileSettings } from '../types';

export const INITIAL_CLIENT_LIST: Client[] = [
  {
    id: "c-1",
    name: "Acme Corp",
    company: "Acme Corporation",
    email: "sarah@acme.com",
    phone: "+1 (555) 010-1234",
    totalBilled: 4200
  },
  {
    id: "c-2",
    name: "TechBrand Studio",
    company: "TechBrand",
    email: "hello@techbrand.io",
    phone: "+1 (555) 302-9852",
    totalBilled: 2800
  },
  {
    id: "c-3",
    name: "Startup X",
    company: "Startup X Inc",
    email: "contact@startupx.co",
    phone: "",
    totalBilled: 550
  },
  {
    id: "c-4",
    name: "Personal Blog",
    company: "",
    email: "blogger@gmail.com",
    phone: "",
    totalBilled: 0
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "p-1",
    clientId: "c-1",
    clientName: "Acme Corp",
    title: "Website Redesign",
    description: "Responsive Redesign of main marketing website in React + TailwindCSS",
    status: "ACTIVE",
    hourlyRate: 75,
    totalHours: 22,
    budget: 3500
  },
  {
    id: "p-2",
    clientId: "c-1",
    clientName: "Acme Corp",
    title: "SEO Audit",
    description: "Technical SEO assessment and keyword optimization report",
    status: "COMPLETED",
    hourlyRate: 60,
    totalHours: 8,
    budget: 1000
  },
  {
    id: "p-3",
    clientId: "c-1",
    clientName: "Acme Corp",
    title: "Monthly Retainer",
    description: "General support and layout fine tuning",
    status: "ACTIVE",
    hourlyRate: 100,
    totalHours: 6,
    budget: 1500
  },
  {
    id: "p-4",
    clientId: "c-2",
    clientName: "TechBrand Studio",
    title: "Brand Identity Design",
    description: "Sleek typography, stationery templates, style guide",
    status: "COMPLETED",
    hourlyRate: 80,
    totalHours: 35,
    budget: 4000
  },
  {
    id: "p-5",
    clientId: "c-3",
    clientName: "Startup X",
    title: "SaaS Landing Page",
    description: "Conversion focused layout for product launch",
    status: "ACTIVE",
    hourlyRate: 55,
    totalHours: 10,
    budget: 2000
  },
  {
    id: "p-6",
    clientId: "c-4",
    clientName: "Personal Blog",
    title: "Ghost Theme Installation",
    description: "Deployment and custom stylesheet editing",
    status: "ACTIVE",
    hourlyRate: 50,
    totalHours: 6.5,
    budget: 500
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-013",
    clientId: "c-1",
    clientName: "Acme Corp",
    clientCompany: "Acme Corporation",
    issueDate: "2026-06-08",
    dueDate: "2026-07-08",
    amount: 1425,
    status: "Draft",
    lineItems: [
      { id: "li-1", description: "Website homepage redesign", qty: 1, unitPrice: 1200, total: 1200 },
      { id: "li-2", description: "Mobile responsiveness fixes", qty: 3, unitPrice: 75, total: 225 }
    ],
    notes: "Payment via bank transfer. Account details on file."
  },
  {
    id: "INV-012",
    clientId: "c-1",
    clientName: "Acme Corp",
    clientCompany: "Acme Corporation",
    issueDate: "2026-05-28",
    dueDate: "2026-06-30",
    amount: 1200,
    status: "Sent",
    lineItems: [
      { id: "li-3", description: "SEO Optimization Sprint", qty: 1, unitPrice: 1200, total: 1200 }
    ],
    notes: "Payment via bank transfer. Thank you for your business!"
  },
  {
    id: "INV-011",
    clientId: "c-2",
    clientName: "TechBrand Studio",
    clientCompany: "TechBrand",
    issueDate: "2026-05-15",
    dueDate: "2026-06-15",
    amount: 800,
    status: "Paid",
    lineItems: [
      { id: "li-4", description: "Asset Packaging Design Work", qty: 10, unitPrice: 80, total: 800 }
    ],
    notes: "Please transfer direct to banking coordinates on file."
  },
  {
    id: "INV-010",
    clientId: "c-3",
    clientName: "Startup X",
    clientCompany: "Startup X Inc",
    issueDate: "2026-05-01",
    dueDate: "2026-07-05",
    amount: 550,
    status: "Draft",
    lineItems: [
      { id: "li-5", description: "Figma Consulting Session", qty: 10, unitPrice: 55, total: 550 }
    ],
    notes: "Payment coordinates in shared files system."
  },
  {
    id: "INV-009",
    clientId: "c-1",
    clientName: "Acme Corp",
    clientCompany: "Acme Corporation",
    issueDate: "2026-04-28",
    dueDate: "2026-05-31",
    amount: 1100,
    status: "Paid",
    lineItems: [
      { id: "li-6", description: "Development Consulting (May retainer)", qty: 11, unitPrice: 100, total: 1100 }
    ],
    notes: "Thank you for selecting us."
  },
  {
    id: "INV-008",
    clientId: "c-2",
    clientName: "TechBrand Studio",
    clientCompany: "TechBrand",
    issueDate: "2026-04-10",
    dueDate: "2026-05-20",
    amount: 650,
    status: "Overdue",
    lineItems: [
      { id: "li-7", description: "Visual Asset Redesign Services", qty: 1, unitPrice: 650, total: 650 }
    ],
    notes: "Urgent. Unpaid beyond term. Standard late penalties might check in."
  },
  {
    id: "INV-007",
    clientId: "c-4",
    clientName: "Personal Blog",
    clientCompany: "",
    issueDate: "2026-03-20",
    dueDate: "2026-04-20",
    amount: 325,
    status: "Paid",
    lineItems: [
      { id: "li-8", description: "CSS Theme Layout Alignment", qty: 6.5, unitPrice: 50, total: 325 }
    ],
    notes: "Paid on time. Thanks!"
  },
  {
    id: "INV-006",
    clientId: "c-3",
    clientName: "Startup X",
    clientCompany: "Startup X Inc",
    issueDate: "2026-03-05",
    dueDate: "2026-04-05",
    amount: 800,
    status: "Paid",
    lineItems: [
      { id: "li-9", description: "High-convert copy layout design", qty: 1, unitPrice: 800, total: 800 }
    ],
    notes: "Completed successfully."
  }
];

export const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  {
    id: "te-1",
    projectId: "p-1",
    projectTitle: "Website Redesign",
    clientId: "c-1",
    clientName: "Acme Corp",
    date: "2026-06-07",
    description: "Final responsive fixes for mobile nav",
    hours: 2.5,
    earnings: 187.5
  },
  {
    id: "te-2",
    projectId: "p-1",
    projectTitle: "Website Redesign",
    clientId: "c-1",
    clientName: "Acme Corp",
    date: "2026-06-05",
    description: "Homepage hero section animation",
    hours: 3.0,
    earnings: 225.0
  },
  {
    id: "te-3",
    projectId: "p-1",
    projectTitle: "Website Redesign",
    clientId: "c-1",
    clientName: "Acme Corp",
    date: "2026-06-03",
    description: "Client feedback revisions round 2",
    hours: 2.0,
    earnings: 150.0
  },
  {
    id: "te-4",
    projectId: "p-1",
    projectTitle: "Website Redesign",
    clientId: "c-1",
    clientName: "Acme Corp",
    date: "2026-06-01",
    description: "About page layout + team section",
    hours: 4.0,
    earnings: 300.0
  },
  {
    id: "te-5",
    projectId: "p-1",
    projectTitle: "Website Redesign",
    clientId: "c-1",
    clientName: "Acme Corp",
    date: "2026-05-30",
    description: "Initial wireframe and component setup",
    hours: 4.0,
    earnings: 300.0
  }
];

export const INITIAL_SETTINGS: ProfileSettings = {
  displayName: "Ryan Tanjaya",
  businessName: "Ryan Dev Studio",
  email: "ryantanjayachen@gmail.com",
  logoUrl: "", // Start clean
  currency: "USD",
  invoicePrefix: "INV",
  paymentTerms: "Net 30",
  defaultNotes: "Please transfer payment to: [Bank details on file]"
};
