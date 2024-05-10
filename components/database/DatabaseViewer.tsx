"use client";

import { ReactNode, useState } from "react";
import { Table as DexieTable } from "dexie";

import { db, useDbPagination } from "@resource/db";

import { Table } from "@components/dasyui/Table";

function Viewer(props: { data: DexieTable<any, any> }) {
  const targets = useDbPagination(props.data, {
    pageNo: 0,
    pageSize: 10,
  });

  return (
    <div className="w-full flex flex-col gap-10 h-full">
      {targets.value == null ? null : targets.value.target[0] == null ? (
        <p className="">データが存在しません</p>
      ) : (
        <>
          <div className="flex flex-col gap-10 h-96 grow">
            <Table
              type="object"
              keyMap={
                Object.keys(targets.value.target[0])
                  .filter((val) => val !== "rowdata" && val !== "rowData")
                  .map((val) => ({ keyName: val })) as any
              }
              target={targets.value.target}
              bordered
            />
            <div className="flex justify-between w-full h-fit">
              <button
                className="btn btn-wide"
                disabled={!targets.value.hasPrev}
                onClick={targets.prev}>
                prev
              </button>
              <div>
                {targets.value.page}/{targets.value.maxPage}
              </div>
              <button
                className="btn btn-wide"
                disabled={!targets.value.hasNext}
                onClick={targets.next}>
                next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const VIEWE_TABLES: (keyof typeof db)[] = [
  "users",
  "games",
  "broadcastTemplates",
  "actions",
  "followers",
  "channelHistories",
  "listenerHistories",
];

export function DatabaseViewer() {
  const [table, setTable] = useState<keyof typeof db>(VIEWE_TABLES[0]);

  return (
    <div className="flex w-full h-full grow gap-4 p-4">
      <ul className="flex flex-col w-2/12 gap-5 h-full menu select-none">
        {VIEWE_TABLES.map((val) => (
          <li key={val}>
            <a className="link w-full" onClick={() => setTable(val)}>
              {val}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex w-10/12 grow grow h-full">
        <Viewer data={db[table] as any} />
      </div>
    </div>
  );
}
