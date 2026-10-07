import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const course = await prisma.course.upsert({
    where: { slug: "speak-english-learn-english" },
    update: {},
    create: {
      slug: "speak-english-learn-english",
      title: "Speak English Learn English",
      description:
        "Go from hesitant to confident in everyday English with live 1-on-1 coaching.",
      pricePaise: 179900,
      isActive: true,
      lessons: {
        create: [
          {
            title: "Week 1 - Confidence & Everyday English",
            order: 1,
            duration: "45 min"
          },
          {
            title: "Week 2 - Sentence Building & Grammar",
            order: 2,
            duration: "45 min"
          },
          {
            title: "Week 3 - Real-Life Communication",
            order: 3,
            duration: "45 min"
          },
          {
            title: "Week 4 - Fluency & Interview Practice",
            order: 4,
            duration: "45 min"
          }
        ]
      }
    }
  });

  console.log("Seeded course:", course.title);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
