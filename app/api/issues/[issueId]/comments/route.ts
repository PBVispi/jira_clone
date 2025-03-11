import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { type DefaultUser, type Comment } from "@prisma/client";
import { z } from "zod";

export type GetIssueCommentsResponse = {
  comments: GetIssueCommentResponse["comment"][];
};

export type GetIssueCommentResponse = {
  comment: Comment & { author: DefaultUser };
};

export async function GET(
  req: NextRequest,
  { params }: { params: { issueId: string } }
) {
  const { issueId } = params;

  const comments = await prisma.comment.findMany({
    where: {
      issueId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const userIds = comments.map((c) => c.authorId);

  // Fetch users directly from the database (Removed Clerk)
  const users = await prisma.defaultUser.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  const commentsForClient = comments.map((comment) => {
    const author = users.find((u) => u.id === comment.authorId) ?? null;
    return { ...comment, author };
  });

  return NextResponse.json({ comments: commentsForClient });
}

const postCommentBodyValidator = z.object({
  content: z.string(),
  authorId: z.string(),
});

export type PostCommentBody = z.infer<typeof postCommentBodyValidator>;

export async function POST(
  req: NextRequest,
  { params }: { params: { issueId: string } }
) {
  // Removed Clerk Authentication and Rate Limiting
  const { issueId } = params;
  const body = await req.json();

  const validated = postCommentBodyValidator.safeParse(body);

  if (!validated.success) {
    const message =
      "Invalid body. " + (validated.error.errors[0]?.message ?? "");
    return new Response(message, { status: 400 });
  }

  const { data: valid } = validated;

  const comment = await prisma.comment.create({
    data: {
      issueId: issueId,
      content: valid.content,
      authorId: valid.authorId,
    },
  });

  // Fetch author from the database instead of Clerk
  const authorForClient = await prisma.defaultUser.findUnique({
    where: {
      id: comment.authorId,
    },
  });

  return NextResponse.json({
    comment: {
      ...comment,
      author: authorForClient,
    },
  });
}
