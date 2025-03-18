import { App, Modal, Setting, TFile } from "obsidian";
import { ImageSuggest, NoteSuggest } from "utils/suggest";

enum FieldType {
    boolean,
    string,
    date,
    file,
    image
}

enum Field {
    name = 'Name',
    middleName = 'Middle Name',
    surname = 'Surname',
    birth = 'Birth',
    death = 'Death',
    image = 'Image',
    mother = 'Mother',
    father = 'Father',
}

const PersonFieldTypes: Record<Field, FieldType> = {
    [Field.name]: FieldType.string,
    [Field.middleName]: FieldType.string,
    [Field.surname]: FieldType.string,
    [Field.birth]: FieldType.date,
    [Field.death]: FieldType.date,
    [Field.image]: FieldType.image,
    [Field.mother]: FieldType.file,
    [Field.father]: FieldType.file,
};

interface PersonFields extends Record<Field, any> { }

function getPersonFromFile(app: App, file: TFile): PersonFields {
    const person = {} as PersonFields;
    const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
    if (!metadata) {
        return person;
    }

    Object.values(Field).forEach((key) => {
        if (key in metadata) {
            const value = metadata[key];

            if ((key === Field.birth || key === Field.death) && typeof value === 'string') {
                person[key] = new Date(value);
            } else {
                person[key] = value;
            }
        }
    });
    return person;
}

export class PersonModal extends Modal {
    person: PersonFields;
    file: TFile;
    constructor(app: App, file: TFile) {
        super(app);
        this.person = getPersonFromFile(app, file)
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        this.setTitle("Edit Person");

        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            getPersonFromFile(this.app, activeFile);
        }

        Object.entries(PersonFieldTypes).forEach(([field, fieldType]) => {
            this.addField(contentEl, field as Field, fieldType);
        });

        new Setting(contentEl)
            .addButton((btn) =>
                btn.setIcon("check").setCta().onClick(() => {
                    onSubmitHandler();
                })
            );
        this.scope.register([], "Enter", (evt) => {
            evt.preventDefault();
            onSubmitHandler();
        });

        const onSubmitHandler = () => {
            this.close();
        };
    }

    private addField(contentEl: HTMLElement, field: Field, type: FieldType) {
        const setting = new Setting(contentEl).setName(field);
    
        // Берём текущее значение из this.person или устанавливаем дефолт
        const currentValue = this.person[field] ?? this.getDefaultValue(type);
    
        const handleChange = (value: any) => {
            if (value === "" || value === null || value === undefined) {
                delete this.person[field]; // Удаляем поле, если значение пустое
            } else {
                this.person[field] = value; // Иначе сохраняем значение
            }
        };
    
        switch (type) {
            case FieldType.boolean:
                setting.addToggle((toggle) =>
                    toggle
                        .setValue(Boolean(currentValue))
                        .onChange((value) => handleChange(value))
                );
                break;
    
            case FieldType.date:
                setting.addText((text) => {
                    text
                        .setValue(currentValue instanceof Date ? this.formatDate(currentValue) : "")
                        .onChange((value) => handleChange(value ? new Date(value) : null));
                    text.inputEl.type = "date";
                });
                break;
    
            case FieldType.string:
                setting.addText((text) =>
                    text
                        .setValue(currentValue as string ?? "")
                        .onChange((value) => handleChange(value))
                );
                break;
    
            case FieldType.file:
                setting.addText((text) => {
                    new NoteSuggest(this.app, text.inputEl);
                    text
                        .setValue((currentValue as string)?.replace(/^\[\[/, '').replace(/\]\]$/, '') ?? "")
                        .onChange((value) => handleChange(value));
                });
                break;
    
            case FieldType.image:
                setting.addText((text) => {
                    new ImageSuggest(this.app, text.inputEl);
                    text
                        .setValue(currentValue as string ?? "")
                        .onChange((value) => handleChange(value));
                });
                break;
        }
    }

    private getDefaultValue(type: FieldType): any {
        switch (type) {
            case FieldType.boolean: return false;
            case FieldType.date: return null;
            case FieldType.string: return "";
            case FieldType.file: return "";
            case FieldType.image: return "";
        }
    }

    private formatDate(date: Date): string {
        return date.toISOString().split("T")[0]; // YYYY-MM-DD
    }
}