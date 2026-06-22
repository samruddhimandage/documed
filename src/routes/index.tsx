import { createFileRoute } from "@tanstack/react-router";
import DocuMedApp from "@/app/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocuMed — Secure Digital Health Records" },
      { name: "description", content: "DocuMed is a secure digital health record platform for patients, doctors, laboratory staff and medical records staff." },
      { property: "og:title", content: "DocuMed — Secure Digital Health Records" },
      { property: "og:description", content: "Secure Digital Health Record Platform for hospitals and clinics." },
    ],
  }),
  component: Index,
});

function Index() {
  return <DocuMedApp />;
}
