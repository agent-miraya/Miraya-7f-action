import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, "action.js");

export async function getCodeAsString(): Promise<string> {
  try {
    const fileContent = await readFile(filePath, "utf-8");
    return fileContent;
  } catch (error) {
    console.error("Error reading the file:", error);
    throw error;
  }
}

export async function getBundledAction(actionName: string): Promise<string> {
  try {
    const filePath = join(__dirname, `../actions/${actionName}.js`);

    const fileContent = await readFile(filePath, "utf-8");
    return fileContent;
  } catch (error) {
    console.error("Error reading the file:", error);
    throw error;
  }
}
