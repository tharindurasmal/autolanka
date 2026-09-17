import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete listings that were created more than 30 days ago and are ACTIVE
    const deleted = await prisma.listing.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        status: "ACTIVE",
      },
    });

    return Response.json({
      success: true,
      message: `Deleted ${deleted.count} expired listings`,
      count: deleted.count,
    });
  } catch (error) {
    console.error("Error deleting expired listings:", error);
    return Response.json(
      { success: false, error: "Failed to delete expired listings" },
      { status: 500 }
    );
  }
}
