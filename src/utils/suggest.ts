import { App, TAbstractFile, AbstractInputSuggest } from 'obsidian';

export class NoteSuggest extends AbstractInputSuggest<string> {
    app: App;
    inputEl: HTMLInputElement;
    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.app = app;
        this.inputEl = inputEl;
    }

    getSuggestions(query: string): string[] {
        const files = this.app.vault.getFiles();
        return files
            .filter((file: TAbstractFile) => {
                return file.name.toLowerCase().includes(query.toLowerCase()) && file.name.endsWith('.md');
            })
            .map((file: TAbstractFile) => {
                return file.name.slice(0, -3);
            });
    }

    renderSuggestion(suggestion: string, el: HTMLElement): void {
        el.createEl('div', { text: suggestion });
    }

    selectSuggestion(suggestion: string): void {
        this.inputEl.value = suggestion;
        this.inputEl.trigger('input');
        this.close();
    }
}

export class ImageSuggest extends AbstractInputSuggest<string> {
    app: App;
    inputEl: HTMLInputElement;
    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.app = app;
        this.inputEl = inputEl;
    }

    getSuggestions(query: string): string[] {
        const files = this.app.vault.getFiles();
        return files
            .filter((file: TAbstractFile) => {
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.ico'];
                return file.name.toLowerCase().includes(query.toLowerCase()) && imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            })
            .map((file: TAbstractFile) => {
                return file.name;
            });
    }

    renderSuggestion(suggestion: string, el: HTMLElement): void {
        el.createEl('div', { text: suggestion });
    }

    selectSuggestion(suggestion: string): void {
        this.inputEl.value = suggestion;
        this.inputEl.trigger('input');
        this.close();
    }
}