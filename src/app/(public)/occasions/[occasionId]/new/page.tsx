import { redirect } from "next/navigation";

// Sessions are now created automatically when media is added for a year.
// This URL is no longer used — redirect back to the occasion.
export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ occasionId: string }>;
}) {
  const { occasionId } = await params;
  redirect(`/occasions/${occasionId}`);
}
