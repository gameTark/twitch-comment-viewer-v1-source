import { ReactNode, useMemo } from "react";
import clsx from "clsx";
import dayjs from "dayjs";

import { isJsonString, urlValidation, urlValidationOnly } from "@libs/regex";

import { CodeJavascript } from "@components/commons/SyntaxHightlight";
import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";
import { ClipboardCopy } from "./ClipboardCopy";
import { useModalContext } from "./Modal";

interface DateType {
  type: "date";
  value: Parameters<typeof dayjs>[0];
  format: string;
}
interface JSXType {
  type: "jsx";
  value: JSX.Element | JSX.Element[];
}
interface NormalType {
  type: "normal";
  value: string | number;
}

export type TableValueType =
  | string
  | number
  | JSXType
  | DateType
  | NormalType
  | null
  | object
  | Date
  | undefined;

interface SimpleTableProps {
  head: string[];
  target: TableValueType[][];
}
interface KeyMap<T, K extends keyof T> {
  keyName: K;
  displayName?: string;
  parse?: (value: T) => ReactNode;
  // TODO: parserをここに定義したいが、型が抽出できない。
}
export interface ObjectTableProps<Target extends object> {
  keyMap: KeyMap<Target, keyof Target>[];
  target: Target[];
}
export interface CSVTableProps {
  tareget: string[][];
}
export type TableProps<Type extends object> = (
  | ({
      type: "simple";
    } & SimpleTableProps)
  | ({
      type: "object";
    } & ObjectTableProps<Type>)
  | ({
      type: "csv";
    } & CSVTableProps)
) & {
  bordered?: boolean;
  consecutive?: boolean;
};

const Cel = (props: { children: ReactNode }) => <td>{props.children}</td>;

export const Table = <T extends object>(props: TableProps<T>) => {
  const modal = useModalContext();
  const celParser = (cel?: TableValueType) => {
    if (cel === null) return "null";
    switch (typeof cel) {
      case "object":
        if (cel instanceof Date) return dayjs(cel).format("YY/MM/DD");
        if ("type" in cel) {
          switch (cel.type) {
            case "date":
              return dayjs(cel.value).format(cel.format);
            default:
              return cel.value;
          }
        } else {
          return (
            <button
              className="btn"
              onClick={() => {
                modal.open(<CodeJavascript code={JSON.stringify(cel, null, 2)} />);
              }}>
              JSON
            </button>
          );
        }
      case "string":
        if (cel.length <= 50) {
          return cel;
        }
        if (isJsonString(cel.trim()))
          return (
            <button
              className="btn"
              onClick={() => {
                modal.open(<CodeJavascript code={JSON.stringify(JSON.parse(cel), null, 2)} />);
              }}>
              JSON
            </button>
          );
        if (urlValidation.test(cel.trim())) return <ClipboardCopy text="URL Data" target={cel} />;
        return <ClipboardCopy text="長文テキスト" target={cel} />;
      case "undefined":
        return "undefined";
      case "function":
        return "NaN";
      case "boolean":
        return cel ? "true" : "false";
      case "symbol":
        return "symbol";
      default:
        return cel;
    }
  };

  const tableInfo = useMemo(() => {
    if (props.type === "simple") {
      return {
        headers: props.head,
        records: props.target.map((val) => val.map(celParser)),
      };
    }
    if (props.type === "object") {
      const headers = props.keyMap.map((val) => {
        const result = val.displayName || val.keyName;
        if (typeof result === "symbol") return "symbol";
        return result;
      });
      // TODO: 2重キーに関しての処理
      const records = props.target.map((record) => {
        return props.keyMap.map((val) => {
          const cel = record[val.keyName];
          if (val.parse != null) return val.parse(record);
          if (cel == null) return null;
          return celParser(cel);
        });
      });
      return {
        headers,
        records,
      };
    }
    return null;
  }, [props]);
  const ps = usePerfectScrollbar([props]);

  if (tableInfo == null) return;
  return (
    <div
      className={clsx("w-full px-2 perfect-scrollbar z-0", {
        ["border"]: props.bordered,
      })}
      ref={ps.ref}>
      <table className="table table-pin-rows">
        <thead>
          <tr>
            {props.consecutive ? <th>#</th> : null}
            {tableInfo.headers.map((val, index) => (
              <th key={index}>
                <div className="flex justify-between items-center">{val}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableInfo.records.map((record, index) => {
            return (
              <tr key={index}>
                {props.consecutive ? <Cel>{index + 1}</Cel> : null}
                {record.map((val, index) => (
                  <Cel key={index}>{val}</Cel>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
