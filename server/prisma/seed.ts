import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, ProjectStatus, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Demo account — also used by the app's "Try demo" mode.
const DEMO_EMAIL = 'demo@kineticledger.app';
const DEMO_PASSWORD = 'demo1234';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Ryan Tanjaya', businessName: 'Ryan Dev Studio', currency: 'USD' },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Ryan Tanjaya',
      businessName: 'Ryan Dev Studio',
      currency: 'USD',
    },
  });

  // Make the seed idempotent: clear this user's data (cascades to projects,
  // time entries, invoices, invoice items) then recreate it.
  await prisma.client.deleteMany({ where: { userId: user.id } });

  // ── Clients ──────────────────────────────────────────────────────────────
  const clientsSeed = [
    { key: 'c-1', name: 'Acme Corp', company: 'Acme Corporation', email: 'sarah@acme.com', phone: '+1 (555) 010-1234' },
    { key: 'c-2', name: 'TechBrand Studio', company: 'TechBrand', email: 'hello@techbrand.io', phone: '+1 (555) 302-9852' },
    { key: 'c-3', name: 'Startup X', company: 'Startup X Inc', email: 'contact@startupx.co', phone: null },
    { key: 'c-4', name: 'Personal Blog', company: null, email: 'blogger@gmail.com', phone: null },
  ];
  const clientId: Record<string, string> = {};
  for (const c of clientsSeed) {
    const created = await prisma.client.create({
      data: { userId: user.id, name: c.name, company: c.company, email: c.email, phone: c.phone },
    });
    clientId[c.key] = created.id;
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  const projectsSeed = [
    { key: 'p-1', client: 'c-1', title: 'Website Redesign', description: 'Responsive redesign in React + Tailwind', status: ProjectStatus.ACTIVE, hourlyRate: 75, totalBudget: 3500 },
    { key: 'p-2', client: 'c-1', title: 'SEO Audit', description: 'Technical SEO assessment and keyword report', status: ProjectStatus.COMPLETED, hourlyRate: 60, totalBudget: 1000 },
    { key: 'p-3', client: 'c-1', title: 'Monthly Retainer', description: 'General support and layout fine-tuning', status: ProjectStatus.ACTIVE, hourlyRate: 100, totalBudget: 1500 },
    { key: 'p-4', client: 'c-2', title: 'Brand Identity Design', description: 'Typography, stationery, style guide', status: ProjectStatus.COMPLETED, hourlyRate: 80, totalBudget: 4000 },
    { key: 'p-5', client: 'c-3', title: 'SaaS Landing Page', description: 'Conversion-focused launch layout', status: ProjectStatus.ACTIVE, hourlyRate: 55, totalBudget: 2000 },
    { key: 'p-6', client: 'c-4', title: 'Ghost Theme Installation', description: 'Deployment and custom stylesheet', status: ProjectStatus.ACTIVE, hourlyRate: 50, totalBudget: 500 },
  ];
  const projectId: Record<string, string> = {};
  for (const p of projectsSeed) {
    const created = await prisma.project.create({
      data: {
        clientId: clientId[p.client],
        title: p.title,
        description: p.description,
        status: p.status,
        hourlyRate: p.hourlyRate,
        totalBudget: p.totalBudget,
      },
    });
    projectId[p.key] = created.id;
  }

  // ── Time entries ─────────────────────────────────────────────────────────
  // Detailed entries for the Website Redesign project.
  await prisma.timeEntry.createMany({
    data: [
      { projectId: projectId['p-1'], description: 'Final responsive fixes for mobile nav', hours: 2.5, date: new Date('2026-06-07') },
      { projectId: projectId['p-1'], description: 'Homepage hero section animation', hours: 3, date: new Date('2026-06-05') },
      { projectId: projectId['p-1'], description: 'Client feedback revisions round 2', hours: 2, date: new Date('2026-06-03') },
      { projectId: projectId['p-1'], description: 'About page layout + team section', hours: 4, date: new Date('2026-06-01') },
      { projectId: projectId['p-1'], description: 'Initial wireframe and component setup', hours: 4, date: new Date('2026-05-30') },
    ],
  });

  // Summary entries for the remaining projects so logged hours/earnings look real.
  const summaryHours: Record<string, number> = { 'p-2': 8, 'p-3': 6, 'p-4': 35, 'p-5': 10, 'p-6': 6.5 };
  for (const [key, hours] of Object.entries(summaryHours)) {
    await prisma.timeEntry.create({
      data: { projectId: projectId[key], description: 'Logged work', hours, date: new Date('2026-05-15') },
    });
  }

  // ── Invoices ─────────────────────────────────────────────────────────────
  type InvoiceSeed = {
    num: string;
    client: string;
    status: InvoiceStatus;
    total: number;
    issue: string;
    due: string;
    notes: string;
    items: Array<[string, number, number]>; // [description, quantity, unitPrice]
  };

  const invoicesSeed: InvoiceSeed[] = [
    { num: 'INV-013', client: 'c-1', status: InvoiceStatus.DRAFT, total: 1425, issue: '2026-06-08', due: '2026-07-08', notes: 'Payment via bank transfer. Account details on file.', items: [['Website homepage redesign', 1, 1200], ['Mobile responsiveness fixes', 3, 75]] },
    { num: 'INV-012', client: 'c-1', status: InvoiceStatus.SENT, total: 1200, issue: '2026-05-28', due: '2026-06-30', notes: 'Thank you for your business!', items: [['SEO Optimization Sprint', 1, 1200]] },
    { num: 'INV-011', client: 'c-2', status: InvoiceStatus.PAID, total: 800, issue: '2026-05-15', due: '2026-06-15', notes: 'Paid — thank you.', items: [['Asset Packaging Design Work', 10, 80]] },
    { num: 'INV-010', client: 'c-3', status: InvoiceStatus.DRAFT, total: 550, issue: '2026-05-01', due: '2026-07-05', notes: '', items: [['Figma Consulting Session', 10, 55]] },
    { num: 'INV-009', client: 'c-1', status: InvoiceStatus.PAID, total: 1100, issue: '2026-04-28', due: '2026-05-28', notes: 'Thank you.', items: [['Development Consulting (May retainer)', 11, 100]] },
    { num: 'INV-008', client: 'c-2', status: InvoiceStatus.OVERDUE, total: 650, issue: '2026-04-10', due: '2026-05-20', notes: 'Unpaid beyond term.', items: [['Visual Asset Redesign Services', 1, 650]] },
    { num: 'INV-007', client: 'c-4', status: InvoiceStatus.PAID, total: 325, issue: '2026-03-20', due: '2026-04-20', notes: 'Paid on time.', items: [['CSS Theme Layout Alignment', 6.5, 50]] },
    { num: 'INV-006', client: 'c-3', status: InvoiceStatus.PAID, total: 800, issue: '2026-03-05', due: '2026-04-05', notes: 'Completed successfully.', items: [['High-convert copy layout design', 1, 800]] },
  ];

  for (const inv of invoicesSeed) {
    const isPaid = inv.status === InvoiceStatus.PAID;
    await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clientId[inv.client],
        invoiceNumber: inv.num,
        status: inv.status,
        totalAmount: inv.total,
        issuedAt: new Date(inv.issue),
        dueDate: new Date(inv.due),
        paidAt: isPaid ? new Date(inv.issue) : null,
        notes: inv.notes || null,
        items: {
          create: inv.items.map(([description, quantity, unitPrice]) => ({
            description,
            quantity,
            unitPrice,
            total: quantity * unitPrice,
          })),
        },
      },
    });
  }

  console.log(
    `✔ Seeded ${DEMO_EMAIL} (password: ${DEMO_PASSWORD}) — ` +
      `${clientsSeed.length} clients, ${projectsSeed.length} projects, ${invoicesSeed.length} invoices.`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
