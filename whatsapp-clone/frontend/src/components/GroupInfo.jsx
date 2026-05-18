export default function GroupInfo({ group }) {
  if (!group) return null;

  return (
    <section className="border-l border-slate-200 bg-white p-4">
      <h2 className="font-semibold text-slate-900">{group.name}</h2>
      <p className="mt-1 text-sm text-slate-500">{group.description}</p>
      <h3 className="mt-5 text-sm font-medium text-slate-700">Members</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-600">
        {group.members?.map((member) => (
          <li key={member.id}>{member.name}</li>
        ))}
      </ul>
    </section>
  );
}
