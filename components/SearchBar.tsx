"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products, categories..."
        aria-label="Search products"
        className="w-full rounded-full border border-border bg-white px-5 py-3 text-sm text-ink placeholder:text-muted shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </div>
  );
};

export default SearchBar;


