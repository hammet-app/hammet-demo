import { CheckCircle2 } from "lucide-react";

type SuccessHeroProps = {
  total: number;
};

export function SuccessHero({
  total,
}: SuccessHeroProps) {

  return (

    <div className="border-b border-border px-8 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
          <CheckCircle2 className="h-8 w-8 text-success-dark" />
        </div>

        <h1
          className="mt-6 text-3xl font-bold text-text-primary"
          style={{ fontFamily: "var(--font-head)", }}
        >
          Import Complete
        </h1>

        <p
          className="mt-3 text-text-muted"
        >
          Successfully imported{" "}
          <span className="font-semibold text-text-primary">
            {total}
          </span>{" "}
          students into Hammet.
        </p>
      </div>
    </div>

  );

}