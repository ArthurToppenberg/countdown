import prisma from "../src/client";
const festivals2026 = [
    {
        name: "Roskilde Festival",
        description: "Denmark's largest music festival at Dyrskuepladsen, Roskilde.",
        startDate: new Date("2026-06-27T16:00:00+02:00"),
        endDate: new Date("2026-07-04T23:59:59+02:00"),
    },
    {
        name: "Distortion Ø",
        description: "Ticketed electronic rave on Refshaleøen during Copenhagen Distortion.",
        startDate: new Date("2026-06-05T18:00:00+02:00"),
        endDate: new Date("2026-06-07T06:00:00+02:00"),
    },
    {
        name: "O Days",
        description: "Three-day music festival at Sønder Hoved on Refshaleøen, Copenhagen.",
        startDate: new Date("2026-07-30T13:00:00+02:00"),
        endDate: new Date("2026-08-01T23:59:59+02:00"),
    },
    {
        name: "Karrusel",
        description: "Three days of electronic music in the woods on Refshaleøen, Copenhagen.",
        startDate: new Date("2026-08-27T18:00:00+02:00"),
        endDate: new Date("2026-08-30T03:00:00+02:00"),
    },
];
const seedEvent = async (festival) => {
    const existing = await prisma.event.findFirst({
        where: { name: festival.name },
    });
    if (existing) {
        return prisma.event.update({
            where: { id: existing.id },
            data: festival,
        });
    }
    return prisma.event.create({
        data: festival,
    });
};
async function main() {
    const events = await Promise.all(festivals2026.map((festival) => seedEvent(festival)));
    console.log(`Seeded ${events.length} events.`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
