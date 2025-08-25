export const formatCurrency = (n, currency = "USD", locale = undefined) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);

export const idGen = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));