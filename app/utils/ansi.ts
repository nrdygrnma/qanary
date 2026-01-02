/**
 * Utility to strip ANSI escape codes from a string.
 * Helpful for cleaning up terminal output (colors, etc.) for display in the UI.
 */
export const stripAnsi = (str: string): string => {
  if (typeof str !== "string") return str;
  // Regex to match ANSI escape codes
  // Inspired by the 'ansi-regex' package
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
  ].join("|");
  const regex = new RegExp(pattern, "g");
  return str.replace(regex, "");
};
