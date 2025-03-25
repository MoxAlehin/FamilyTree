import { App, TFile } from "obsidian";

interface Person {
    name: string;
    birth?: string;
    death?: string;
    image?: string;
    father?: Person;
    mother?: Person;
    children: Person[];
}

// Считывает информацию о родителях и базовые данные
function parseMetadata(metadata: Record<string, any>) {
    return {
        name: `${metadata?.Name ?? "Unknown"} ${metadata?.MiddleName ?? ""} ${metadata?.Surname ?? ""}`.trim(),
        birth: metadata?.Birth,
        death: metadata?.Death,
        image: metadata?.Image,
        father: extractLink(metadata?.Father),
        mother: extractLink(metadata?.Mother),
    };
}

// Извлекает имя файла из ссылки [[Father]]
function extractLink(link: string | undefined): string | undefined {
    if (!link) return undefined;
    const match = link.match(/\[\[(.*?)\]\]/);
    return match ? match[1] : undefined;
}

// Ищет файл по названию (без расширения)
function findFileByName(app: App, name: string): TFile | null {
    return app.vault.getMarkdownFiles().find((file) => file.basename === name) || null;
}

// Рекурсивный сбор данных о семье
export async function collectFamilyTree(app: App, file: TFile, visited = new Set<string>()): Promise<Person> {
    console.log(file);
    if (visited.has(file.path)) return { name: "Unknown", children: [] };
    visited.add(file.path);

    const metadata = app.metadataCache.getFileCache(file)?.frontmatter || {};
    const { name, birth, death, image, father, mother } = parseMetadata(metadata);

    const person: Person = { name, birth, death, image, children: [] };

    // Рекурсивно обрабатываем родителей
    if (father) {
        const fatherFile = findFileByName(app, father);
        if (fatherFile) {
            person.father = await collectFamilyTree(app, fatherFile, visited);
        }
    }

    if (mother) {
        const motherFile = findFileByName(app, mother);
        if (motherFile) {
            person.mother = await collectFamilyTree(app, motherFile, visited);
        }
    }

    // Находим детей по обратным ссылкам
    for (const childFile of app.vault.getMarkdownFiles()) {
        const childMetadata = app.metadataCache.getFileCache(childFile)?.frontmatter;
        if (!childMetadata) continue;

        if (extractLink(childMetadata.Father) === file.basename || extractLink(childMetadata.Mother) === file.basename) {
            person.children.push(await collectFamilyTree(app, childFile, visited));
        }
    }

    return person;
}