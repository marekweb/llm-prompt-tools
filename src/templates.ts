import { promises as fs } from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";

const cachedTemplates = new Map();

export async function renderTemplate(
  templateFilename: string,
  data?: unknown
): Promise<string> {
  let template = cachedTemplates.get(templateFilename);
  if (!template) {
    const templatePath = path.join("templates", `${templateFilename}.hbs`);
    const templateBody = await fs.readFile(templatePath, "utf8");
    template = Handlebars.compile(templateBody, { noEscape: true });
    cachedTemplates.set(templateFilename, template);
  }
  return template(data);
}
