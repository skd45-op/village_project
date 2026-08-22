"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canCreateInModule, isMemberOrAbove } from "@/lib/auth";
import { notifyAllMembers } from "@/lib/notify";

export async function createPoll(form: FormData) {
  const user = await getCurrentUser();
  if (!canCreateInModule(user, "polls")) throw new Error("Not authorized for the polls module.");

  const title = (form.get("title") as string)?.trim();
  const optionsRaw = (form.get("options") as string) ?? "";
  const expiresRaw = (form.get("expiresAt") as string) || "";
  const options = optionsRaw
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);

  if (!title) throw new Error("A poll title is required.");
  if (options.length < 2) throw new Error("Add at least two options (one per line).");

  await prisma.poll.create({
    data: {
      title,
      options,
      // Resolved decision: all polls are Members+ only — guests never vote.
      visibility: "members",
      createdById: user!.id,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
    },
  });

  await notifyAllMembers("new_poll", `New poll: ${title}`);
  revalidatePath("/polls");
  redirect("/polls");
}

export async function votePoll(form: FormData) {
  const user = await getCurrentUser();
  if (!isMemberOrAbove(user)) throw new Error("Only members can vote.");

  const pollId = form.get("pollId") as string;
  const option = form.get("option") as string;
  if (!pollId || !option) throw new Error("Pick an option.");

  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) throw new Error("Poll not found.");
  if (poll.expiresAt && poll.expiresAt < new Date()) throw new Error("This poll has closed.");
  if (!(poll.options as string[]).includes(option)) throw new Error("Invalid option.");

  // One vote per member per poll; re-voting updates the choice.
  await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId: user!.id } },
    create: { pollId, userId: user!.id, option },
    update: { option },
  });
  revalidatePath("/polls");
}
