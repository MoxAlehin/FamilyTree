import { normalizePath, Plugin, TFile } from 'obsidian';
import { SettingTab, FamilyTreeSettings, DEFAULT_SETTINGS } from "settings"
import { addCommands } from 'commands';
import { registerView } from 'view';
import { collectFamilyTree } from 'tree-data';

export default class FamilyTreePlugin extends Plugin {
	settings: FamilyTreeSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));
		addCommands(this);
		registerView(this);
		const file = this.app.vault.getFileByPath("Father.md") as TFile;
		console.log(file)
        const familyTree = await collectFamilyTree(this.app, file);
        console.log(familyTree);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);;
	}
}