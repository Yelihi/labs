import Handlebars from 'handlebars';
import fs from 'fs-extra';

export async function renderTemplate(
  templatePath: string,
  context: Record<string, unknown>,
): Promise<string> {
  const source = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(context);
}
