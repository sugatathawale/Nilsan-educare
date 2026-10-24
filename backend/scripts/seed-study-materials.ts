import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function writeDummyPdf(filePath: string, title: string) {
  const content = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 68 >>stream
BT /F1 18 Tf 72 720 Td (${title.replace(/[()\\]/g, "")}) Tj ET
endstream
endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000386 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
465
%%EOF
`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const materials = [
  {
    title: "Everyday English Starter Pack",
    description: "Useful phrases for greetings, introductions, and small talk.",
    filename: "everyday-english-starter-pack.pdf",
    section: "NOTES" as const,
    sortOrder: 1
  },
  {
    title: "Spoken English Handbook",
    description: "A short e-book for daily speaking confidence.",
    filename: "spoken-english-handbook.pdf",
    section: "BOOKS" as const,
    sortOrder: 2
  },
  {
    title: "Grammar Quick Revision PDF",
    description: "Tenses, articles, and prepositions in one short worksheet.",
    filename: "grammar-quick-revision.pdf",
    section: "WORKSHEETS" as const,
    sortOrder: 3
  },
  {
    title: "English PYQ Pack 2024",
    description: "Previous year questions with short answer hints.",
    filename: "english-pyq-pack-2024.pdf",
    section: "PYQS" as const,
    sortOrder: 4
  }
];

async function main() {
  await prisma.libraryPlan.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "Notes & Audiobook Access",
      description:
        "Unlock all premium lecture notes and audiobooks. First few items stay free forever.",
      pricePaise: 49900,
      freeLimit: 5
    }
  });

  const uploadsDir = path.resolve(process.cwd(), "uploads", "library");

  for (const item of materials) {
    const absolute = path.join(uploadsDir, item.filename);
    writeDummyPdf(absolute, item.title);

    const existing = await prisma.libraryResource.findFirst({
      where: { title: item.title, type: "NOTE" }
    });

    if (existing) {
      await prisma.libraryResource.update({
        where: { id: existing.id },
        data: {
          section: item.section,
          description: item.description,
          fileUrl: `/uploads/library/${item.filename}`,
          isFree: true,
          isActive: true,
          sortOrder: item.sortOrder
        }
      });
      console.log("Updated:", item.title);
    } else {
      await prisma.libraryResource.create({
        data: {
          type: "NOTE",
          section: item.section,
          title: item.title,
          description: item.description,
          fileUrl: `/uploads/library/${item.filename}`,
          isFree: true,
          isActive: true,
          sortOrder: item.sortOrder
        }
      });
      console.log("Created:", item.title);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
