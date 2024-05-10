// TODO: 注釈のはてなを挿入したい
export const Stat = (props: {
  title?: string | JSX.Element;
  icon?: string | JSX.Element;
  value: string | JSX.Element | number;
  caption?: string | JSX.Element;
}) => {
  return (
    <div className="stat">
      {props.icon == null ? null : <div className="stat-figure">{props.icon}</div>}
      {props.title == null ? null : <div className="stat-title">{props.title}</div>}

      {props.value == null ? null : (
        <div className="stat-value">
          <span className="">{props.value}</span>
        </div>
      )}
      {props.caption == null ? null : <div className="stat-desc">{props.caption}</div>}
    </div>
  );
};
