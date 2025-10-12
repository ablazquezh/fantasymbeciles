// utils/bigint.ts
export const safeJson = (data: any) =>
  JSON.parse(
    JSON.stringify(data, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    )
  );
