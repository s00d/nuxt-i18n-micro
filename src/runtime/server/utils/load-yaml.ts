import { readFile } from 'node:fs/promises'

export async function loadYaml(filePath: string) {
  try {
    const yaml = await import('js-yaml')
    const content = await readFile(filePath, 'utf-8')
    return yaml.load(content)
  }
  catch (e: unknown) {
    console.error(e)
    console.warn(
      'js-yaml is not installed, please install it if you want to use YAML files for translations.',
    )
    return null
  }
}
