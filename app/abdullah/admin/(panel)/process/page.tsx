import { CrudPage, defineCrud } from "@/components/admin/kit";

const config = defineCrud({
  table: "process_steps",
  title: "Process chat",
  singular: "Message",
  tag: "content:process_steps",
  fields: [
    {
      name: "sender",
      label: "Who says it",
      type: "select",
      required: true,
      options: [
        { value: "abdullah", label: "Abdullah (left bubble)" },
        { value: "client", label: "Client (right bubble)" },
      ],
      help: "Client lines are a written example of a question a client might ask. The site tells visitors it is not a real chat.",
    },
    {
      name: "message",
      label: "Message",
      type: "bilingual-textarea",
      required: true,
      help: "Write Roman Urdu naturally; do not translate word by word. Keep each message short enough to read on a phone.",
    },
  ],
  tableColumns: ["sender", "message"],
  searchFields: ["message_en", "message_ur"],
  defaultValues: { sender: "abdullah" },
});

export default function Page() {
  return <CrudPage config={config} />;
}
