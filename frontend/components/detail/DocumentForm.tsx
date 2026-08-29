"use client";

interface FormField {
  label: string;
  value: string | number | null | undefined;
}

interface DocumentFormProps {
  title: string;
  fields: FormField[];
  accentColor?: string;
}

export function DocumentForm({
  title,
  fields,
  accentColor = "border-l-accent",
}: DocumentFormProps) {
  return (
    <div
      className={`bg-cream-card border border-cream-border border-l-4 ${accentColor} rounded-lg p-4`}
    >
      <h3 className="text-sm font-semibold text-charcoal-text mb-3">{title}</h3>
      <div className="space-y-2.5">
        {fields.map((field, i) => (
          <div key={i}>
            <p className="text-xs text-text-muted">{field.label}</p>
            <p className="text-sm text-charcoal-text">{field.value ?? "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
