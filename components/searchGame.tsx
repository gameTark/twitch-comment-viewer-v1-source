"use client";

import { useEffect, useState } from "react";

import { fetchSearchCategories } from "@libs/twitch";
import { useDebounce, useInput } from "@libs/uses";

export const SearchGame = () => {
  const [search, changeSearchHandler] = useInput();
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchSearchCategories>> | null>(
    null,
  );

  const event = useDebounce(
    500,
    async (text: string) => {
      if (text === "" || text == null) return null;
      const item = await fetchSearchCategories({
        query: text,
      });
      setResult(item);
    },
    [],
  );

  useEffect(() => {
    event(search);
  }, [search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        value={search}
        onChange={changeSearchHandler}
      />
      {result != null ? (
        <ul>
          {result.map((value) => {
            return (
              <li key={value.id}>
                <div>
                  <img src={value.box_art_url} alt={value.name} width={30} />
                  <p>{value.name}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
