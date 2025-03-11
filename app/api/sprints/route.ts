import { prisma } from "@/server/db";
import { SprintStatus, type Sprint } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

export type PostSprintResponse = {
  sprint: Sprint;
};

export type GetSprintsResponse = {
  sprints: Sprint[];
};

export async function POST(req: NextRequest) {
  const userId = "user_2PwZmH2xP5aE0svR6hDH4AwDlcu"; // Dummy user ID

  const sprints = await prisma.sprint.findMany({
    where: {
      creatorId: userId,
    },
  });

  const k = sprints.length + 1;

  const sprint = await prisma.sprint.create({
    data: {
      name: `SPRINT-${k}`,
      description: "",
      creatorId: userId,
    },
  });

  return NextResponse.json({ sprint });
}

export async function GET(req: NextRequest) {
  const userId = "init-user"; // Dummy user ID

  const sprints = await prisma.sprint.findMany({
    where: {
      OR: [{ status: SprintStatus.ACTIVE }, { status: SprintStatus.PENDING }],
      creatorId: userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({ sprints });
}
