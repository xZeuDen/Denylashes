import AnnouncementBar from "./AnnouncementBar";
import HeaderNav from "./HeaderNav";
import NewsletterFooter from "./NewsletterFooter";

type PolicyLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

const PolicyLayout = ({ eyebrow, title, intro, sections }: PolicyLayoutProps) => {
  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-[920px] flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm leading-6 text-muted">{intro}</p>
        </div>

        <section className="grid gap-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[20px] border border-border bg-white p-6 shadow-soft"
            >
              <h2 className="text-lg font-semibold text-ink">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default PolicyLayout;
