export const parseYAMLFrontMatter = (content: string): Record<string, string> | null => {
  const delimiter = '---';
  const start = content.indexOf(delimiter);
  if (start === -1) {
    console.error('No se encontró el delimitador de inicio YAML.');
    return null;
  }
  
  const end = content.indexOf(delimiter, start + delimiter.length);
  if (end === -1) {
    console.error('No se encontró el delimitador de fin YAML.');
    return null;
  }
  
  // Extrae el bloque YAML sin incluir los delimitadores y quita espacios en blanco
  const yamlBlock = content.slice(start + delimiter.length, end).trim();
  if (!yamlBlock) return {};

  const result: Record<string, string> = {};
  const lines = yamlBlock.split('\n');

  for (const line of lines) {
    const [rawKey, ...rawValueParts] = line.split(':');
    if (rawKey && rawValueParts.length > 0) {
      const key = rawKey.trim();
      // Une el resto de la línea en caso de que contenga más de un ':'
      const value = rawValueParts.join(':').trim().replace(/^"|"$/g, '');
      result[key] = value;
    }
  }
  
  return result;
};
