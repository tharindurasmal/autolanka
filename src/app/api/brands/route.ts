import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VehicleType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");

  if (!typeParam) {
    return NextResponse.json({ error: "Vehicle type is required" }, { status: 400 });
  }

  const type = typeParam as VehicleType;

  try {
    const brands = await prisma.brand.findMany({
      where: { type },
      include: {
        models: {
          where: { type },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching filtered brands:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}