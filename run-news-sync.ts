import { PrismaClient } from "@prisma/client";
import { runKind } from "./lib/ingest/runner";

const prisma = new PrismaClient();

async function main() {
  console.log("Triggering news RSS ingestion locally...");
  const deadline = Date.now() + 60 * 1000; // 1 minute deadline
  
  // Make sure news sources are set to active for local testing
  await prisma.dataSource.updateMany({
    where: { kind: "news", name: { in: ["DonanımHaber", "ShiftDelete", "Webrazzi"] } },
    data: { isActive: true }
  });

  const result = await runKind("news", 5, deadline);
  console.log("Sync outcome:");
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
