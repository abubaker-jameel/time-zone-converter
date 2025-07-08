import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import { Input } from "./input";

type Timezone = {
  label: string;
  value: string;
  offset: string;
};

const PAGE_SIZE = 10;

type Props = {
    onSelect: (tz: Timezone) => void;
};

const TimezoneSearchInput: FC<Props> = ({onSelect}) => {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [query, setQuery] = useState<string>("");
  const [filtered, setFiltered] = useState<Timezone[]>([]);
  const [visibleResults, setVisibleResults] = useState<Timezone[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    fetch("/timezones-full.json")
      .then((res) => res.json())
      .then((data: Timezone[]) => setTimezones(data))
      .catch((err) => console.error("Failed to load timezones:", err));
  }, []);

  // Filter timezones when query changes
  useEffect(() => {
    const lowerQuery = query.toLowerCase();
    const result =
      query.trim() === ""
        ? timezones
        : timezones.filter(
            (tz) =>
              tz.label.toLowerCase().includes(lowerQuery) ||
              tz.value.toLowerCase().includes(lowerQuery)
          );

    setFiltered(result);
    setPage(1);
    setVisibleResults(result.slice(0, PAGE_SIZE));
  }, [query, timezones]);

  const handleScroll = () => {
    const el = dropdownRef.current;
    if (!el) return;

    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    if (isBottom && visibleResults.length < filtered.length) {
      const nextPage = page + 1;
      const nextResults = filtered.slice(0, nextPage * PAGE_SIZE);
      setVisibleResults(nextResults);
      setPage(nextPage);
    }
  };

  const handleSelect = (tz: Timezone) => {
    onSelect(tz);
    setQuery(""); // clear after selection
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        className="w-full border px-3 py-2 rounded"
        placeholder="Search time zone..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => {
          setIsDropdownOpen(true);
          if (query.trim() === "") {
            // Show first 10 on focus
            setFiltered(timezones);
            setVisibleResults(timezones.slice(0, PAGE_SIZE));
            setPage(1);
          }
        }}
      />
      {isDropdownOpen && visibleResults.length > 0 && (
        <ul
          ref={dropdownRef}
          onScroll={handleScroll}
          className="absolute left-0 right-0 mt-1 border bg-white rounded shadow-md max-h-60 overflow-y-auto z-10"
        >
          {visibleResults.map((tz) => (
            <li
              key={tz.value}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(tz)}
            >
              {tz.label} (UTC{tz.offset})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimezoneSearchInput;
