import fs from "fs/promises";
import yaml from "js-yaml";

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export async function loadData(filename: string): Promise<unknown> {
  const body = await fs.readFile(filename + ".yml", "utf8");
  return yaml.load(body);
}
