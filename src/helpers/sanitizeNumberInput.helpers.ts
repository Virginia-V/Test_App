export const sanitizedNumberField = (
  value: string,
  func: (sanitizedValue: string) => void
) => {
  const sanitizedValue = value.replace(/[^0-9.]|(\.[0-9]*\.)/g, "");
  func(sanitizedValue);
};
