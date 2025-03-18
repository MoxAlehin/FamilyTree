import { App, Modal, Setting, TFile } from "obsidian";
import { ImageSuggest, NoteSuggest } from "utils/suggest";

export enum FieldType {
    boolean,
    string,
    date,
    file,
    image
}

export enum Field {
    name = 'Name',
    middleName = 'Middle Name',
    surname = 'Surname',
    birth = 'Birth',
    death = 'Death',
    image = 'Image',
    mother = 'Mother',
    father = 'Father',
}

export const PersonFieldTypes: Record<Field, FieldType> = {
    [Field.name]: FieldType.string,
    [Field.middleName]: FieldType.string,
    [Field.surname]: FieldType.string,
    [Field.birth]: FieldType.date,
    [Field.death]: FieldType.date,
    [Field.image]: FieldType.image,
    [Field.mother]: FieldType.file,
    [Field.father]: FieldType.file,
};

export interface PersonFields extends Record<Field, any> { }

function getPersonFromFile(app: App, file: TFile): PersonFields {
    const person = {} as PersonFields;
    const metadata = app.metadataCache.getFileCache(file)?.frontmatter;
    if (!metadata) {
        return person;
    }

    Object.values(Field).forEach((key) => {
        if (key in metadata) {
            person[key] = metadata[key];
        }
    });
    return person;
}

export class PersonModal extends Modal {
    person: PersonFields;
    file: TFile;

    constructor(app: App, file: TFile) {
        super(app);
        this.file = file;
        this.person = getPersonFromFile(app, file);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        this.setTitle("Edit Person");

        Object.entries(PersonFieldTypes).forEach(([field, fieldType]) => {
            this.addField(contentEl, field as Field, fieldType);
        });

        new Setting(contentEl)
            .addButton((btn) =>
                btn.setIcon("check").setCta().onClick(() => {
                    this.handleSubmit();
                })
            );

        this.scope.register([], "Enter", (evt) => {
            evt.preventDefault();
            this.handleSubmit();
        });
    }

    private handleSubmit() {
        this.app.fileManager.processFrontMatter(this.file, (frontmatter) => {
            Object.values(Field).forEach((field) => {
                delete frontmatter[field];
            });
            Object.values(Field).forEach((field) => {
                if (field in this.person) {
                    frontmatter[field] = this.person[field];
                }
            });
        })
        this.close();
    }

    private addField(contentEl: HTMLElement, field: Field, type: FieldType) {
        const setting = new Setting(contentEl).setName(field);

        const currentValue = this.person[field] ?? this.getDefaultValue(type);

        const handleChange = (value: any, valueToWrite: any = value) => {
            if (value === "" || value === null || value === undefined) {
                delete this.person[field];
            } else {
                this.person[field] = valueToWrite;
            }
        };

        switch (type) {
            case FieldType.boolean:
                setting.addToggle((toggle) =>
                    toggle
                        .setValue(Boolean(currentValue))
                        .onChange(handleChange)
                );
                break;
            case FieldType.date:
                setting.addText((text) => {
                    text
                        // .setValue(currentValue instanceof Date ? this.formatDate(currentValue) : "")
                        .setValue(currentValue as string ?? "")
                        .setPlaceholder('YYYY-MM-DD')
                        .onChange(handleChange);
                    // text.inputEl.type = "date";
                });
                break;
            case FieldType.string:
                setting.addText((text) =>
                    text
                        .setValue(currentValue as string ?? "")
                        .onChange(handleChange)
                );
                break;
            case FieldType.file:
                setting.addText((text) => {
                    new NoteSuggest(this.app, text.inputEl);
                    text
                        .setValue((currentValue as string)?.replace(/^\[\[/, '').replace(/\]\]$/, '') ?? "")
                        .onChange(value => {
                            handleChange(value, `[[${value}]]`)
                        });
                });
                break;
            case FieldType.image:
                setting.addText((text) => {
                    new ImageSuggest(this.app, text.inputEl);
                    text
                        .setValue(currentValue as string ?? "")
                        .onChange(handleChange);
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
}