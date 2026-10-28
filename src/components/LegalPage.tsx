import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { operator } from "@/config/operator";

interface Section {
  title: string;
  text: string;
}

const fill = (text: string) => text.split("{{name}}").join(operator.name).split("{{email}}").join(operator.email);

/** Plain text with the operator's address turned into a mailto link. */
function Linked({ text }: { text: string }) {
  const parts = text.split(operator.email);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a href={`mailto:${operator.email}`} className="text-primary hover:underline">
              {operator.email}
            </a>
          )}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Text from a language file: paragraphs separated by a blank line, lines starting with "- "
 * form a list, {{name}} and {{email}} become the operator's name and (linked) address.
 */
export function TextBlocks({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-muted-foreground leading-relaxed">
      {fill(text)
        .split("\n\n")
        .map((block, i) =>
          block.startsWith("- ") ? (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {block.split("\n").map((line) => (
                <li key={line}>
                  <Linked text={line.replace(/^- /, "")} />
                </li>
              ))}
            </ul>
          ) : (
            <p key={i} className="whitespace-pre-line">
              <Linked text={block} />
            </p>
          ),
        )}
    </div>
  );
}

/**
 * Imprint, privacy policy and terms: a title and sections from legal.<page> in the language files.
 */
export function LegalPage({ page, showUpdated = true }: { page: "imprint" | "privacy" | "terms"; showUpdated?: boolean }) {
  const { t, i18n } = useTranslation();
  const sections = t(`legal.${page}.sections`, { returnObjects: true }) as Section[];
  const updated = new Intl.DateTimeFormat(i18n.language, { dateStyle: "long" }).format(new Date(operator.legalUpdated));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 break-words hyphens-auto">{t(`legal.${page}.title`)}</h1>
          {showUpdated && <p className="text-sm text-muted-foreground mb-10">{t("legal.updated", { date: updated })}</p>}
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                <TextBlocks text={section.text} />
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
