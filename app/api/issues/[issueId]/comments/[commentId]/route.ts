import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

const patchCommentBodyValidator = z.object({
  content: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  // Always authenticate by setting a dummy user ID
  const userId = "user_2PwZmH2xP5aE0svR6hDH4AwDlcu"; // This simulates a logged-in user

  const { commentId } = params;
  const body = await req.json();

  const validated = patchCommentBodyValidator.safeParse(body);

  if (!validated.success) {
    const message =
      "Invalid body. " + (validated.error.errors[0]?.message ?? "");
    return new Response(message, { status: 400 });
  }

  const { data: valid } = validated;

  const comment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content: valid.content,
      isEdited: true,
    },
  });

  return NextResponse.json({
    comment: {
      ...comment,
      author: {
        id: userId,
        name: "Dummy User",
        avatar: "/default-avatar.png",
      },
    },
  });
}
