"use client";

type FiltersBarProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onClear: () => void;
  isDirty: boolean;
};

const FiltersBar = ({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  onClear,
  isDirty,
}: FiltersBarProps) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isActive
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink hover:-translate-y-0.5 hover:border-ink/40"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Sort by
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label="Sort products"
            className="ml-3 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price Low → High</option>
            <option value="price-high">Price High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </label>
        <button
          type="button"
          onClick={onClear}
          disabled={!isDirty}
          className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default FiltersBar;


