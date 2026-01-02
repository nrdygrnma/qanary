import path from "node:path";

export const getQanaryDataDir = () => {
  const envDir = process.env.QANARY_DATA_DIR?.trim();
  return envDir ? path.resolve(envDir) : path.resolve(process.cwd(), ".qanary");
};

export const getRunsDir = () => path.join(getQanaryDataDir(), "runs");
