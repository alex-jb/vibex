import { redirect } from "next/navigation";

// /create-card has been promoted to the landing page at /
// This route now redirects for backward compatibility with old links
export default function CreateCardPage() {
  redirect("/");
}
