import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import {
  IssueType,
  type Issue,
  IssueStatus,
  type DefaultUser,
} from "@prisma/client";
import { z } from "zod";
import {
  calculateInsertPosition,
  generateIssuesForClient,
} from "@/utils/helpers";

const postIssuesBodyValidator = z.object({
  name: z.string(),
  type: z.enum(["BUG", "STORY", "TASK", "EPIC", "SUBTASK"]),
  sprintId: z.string().nullable(),
  reporterId: z.string().nullable(),
  parentId: z.string().nullable(),
  sprintColor: z.string().nullable().optional(),
});

export type PostIssueBody = z.infer<typeof postIssuesBodyValidator>;

const patchIssuesBodyValidator = z.object({
  ids: z.array(z.string()),
  type: z.nativeEnum(IssueType).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  assigneeId: z.string().nullable().optional(),
  reporterId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  isDeleted: z.boolean().optional(),
});

export type PatchIssuesBody = z.infer<typeof patchIssuesBodyValidator>;

type IssueT = Issue & {
  children: IssueT[];
  sprintIsActive: boolean;
  parent: Issue & {
    sprintIsActive: boolean;
    children: IssueT[];
    parent: null;
    assignee: DefaultUser | null;
    reporter: DefaultUser | null;
  };
  assignee: DefaultUser | null;
  reporter: DefaultUser | null;
};

export type GetIssuesResponse = {
  issues: IssueT[];
};

export async function GET(req: NextRequest) {
  const activeIssues = await prisma.issue.findMany({
    where: {
      isDeleted: false,
    },
  });

  if (!activeIssues || activeIssues.length === 0) {
    return NextResponse.json({ issues: [] });
  }

  const activeSprints = await prisma.sprint.findMany({
    where: {
      status: "ACTIVE",
    },
  });

  const userIds = activeIssues
    .flatMap((issue) => [issue.assigneeId, issue.reporterId] as string[])
    .filter(Boolean);

  // Fetch users from the database instead of Clerk
  const users = await prisma.defaultUser.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  const issuesForClient = generateIssuesForClient(
    activeIssues,
    users,
    activeSprints.map((sprint) => sprint.id)
  );

  return NextResponse.json({ issues: issuesForClient });
}

// POST
export async function POST(req: NextRequest) {
  // Default user since Clerk is removed
  const defaultUserId = "init-user";

  const body = await req.json();

  if (!body.name || !body.type) {
    return new Response("Missing required fields", { status: 400 });
  }

  const issues = await prisma.issue.findMany({
    where: {
      creatorId: defaultUserId, // Use the default user
    },
  });

  const issueCount = issues.length + 1;

  try {
    const issue = await prisma.issue.create({
      data: {
        key: `ISSUE-${issueCount}`,
        name: body.name,
        type: body.type,
        reporterId: body.reporterId ?? defaultUserId, // Default reporter
        sprintId: body.sprintId ?? null, // Ensure null if undefined
        sprintPosition: body.sprintPosition ?? 0,
        boardPosition: body.boardPosition ?? -1,
        parentId: body.parentId ?? null,
        sprintColor: body.sprintColor ?? null,
        creatorId: defaultUserId, //  FIX: Explicitly set the creatorId
        description: body.description ?? "",
        status: body.status ?? "TODO",
        assigneeId: body.assigneeId ?? null,
        isDeleted: false,
      },
    });

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("Error creating issue:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// PATCH
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const validated = patchIssuesBodyValidator.safeParse(body);

  if (!validated.success) {
    const message = "Invalid body. " + validated.error.errors[0]?.message ?? "";
    return new Response(message, { status: 400 });
  }

  const { data: valid } = validated;

  const issuesToUpdate = await prisma.issue.findMany({
    where: {
      id: {
        in: valid.ids,
      },
    },
  });

  const updatedIssues = await Promise.all(
    issuesToUpdate.map(async (issue) => {
      return await prisma.issue.update({
        where: {
          id: issue.id,
        },
        data: {
          type: valid.type ?? undefined,
          status: valid.status ?? undefined,
          assigneeId: valid.assigneeId ?? undefined,
          reporterId: valid.reporterId ?? undefined,
          isDeleted: valid.isDeleted ?? undefined,
          sprintId: valid.sprintId === undefined ? undefined : valid.sprintId,
          parentId: valid.parentId ?? undefined,
        },
      });
    })
  );

  return NextResponse.json({ issues: updatedIssues });
}
