const ParseOrderBy = (
  defaultOrderBy: string, // Ex: createdAt:asc
  clientOrderBy?: string,
  nulls: "last" | "first" = "last"
) => {
  return parse(clientOrderBy || defaultOrderBy, nulls);
};

const parse = (orderBy: string, _nulls: "last" | "first" = "last") => {
  const levels = orderBy.split(",");
  return levels.map((level) => {
    let [attr, direction] = level.split(":");

    if (attr.includes("_count")) {
      attr = attr.split(".")[1];
      return {
        [attr]: {
          _count: direction,
        },
      };
    } else if (attr.includes(".")) {
      let [a, b] = attr.split(".");
      return {
        [a]: {
          [b]: direction,
        },
      };
    }

    return { [attr]: direction };
  });
};

export default ParseOrderBy;
