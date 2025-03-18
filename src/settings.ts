import { App, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import FamilyTreePlugin from 'main';

export interface FamilyTreeSettings {
	image: string;
}

export const DEFAULT_SETTINGS: FamilyTreeSettings = {
	image: 'Image',
};

export function setSetting(key: string, value: string, settings: FamilyTreeSettings) {
	key = key.toLowerCase();
	const type = typeof settings[key as keyof FamilyTreeSettings];
	let val;

	switch (type) {
        case "boolean":
            val = value.toLowerCase() === "true";
			break;
        case "number":
            val = value.includes(".") ? parseFloat(value) : parseInt(value);
			break;
        case "string":
            val = value;
			break;
    }

	(settings[key as keyof FamilyTreeSettings] as any) = val;
}

export class SettingTab extends PluginSettingTab {
	plugin: FamilyTreePlugin;

	constructor(app: App, plugin: FamilyTreePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// Check if TextComponent value matches regex and do some cosmetic stuff
	checkNumber = async (text: TextComponent, regex: RegExp = /^(100|[1-9]?[0-9])$/): Promise<boolean> => {
		const value = text.getValue();
		// Delete useless heading zeros
		if (value[0] == '0' && value.length > 1)
			text.setValue(value.slice(1));

		if (regex.test(value)) {
			// save valid data to attribute
			text.inputEl.setAttribute('data-last-valid', value);
			return true;
		}
		// if value isn't empty and doesn't match then we should set last valid value
		else if (value != '')
			text.setValue(text.inputEl.getAttribute('data-last-valid') || '');
		return false;
	};

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass("family-tree-settings")

		// Image Name Text
		new Setting(containerEl)
			.setName('Image property name')
			.setDesc('Obsidian property which is used as Image reference')
			.addText(text => {
				text
					.setValue(this.plugin.settings.image)
					.onChange(async value => {
						this.plugin.settings.image = value;
						await this.plugin.saveSettings();
					});
			});
	}
}

