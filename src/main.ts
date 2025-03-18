import { Plugin } from 'obsidian';
import { SettingTab, FamilyTreeSettings, DEFAULT_SETTINGS } from "settings"
import { PersonModal } from 'modals/person-modal';

export default class FamilyTreePlugin extends Plugin {
	settings: FamilyTreeSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));
		this.addCommands();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);;
	}

	addCommands() {
		this.addCommand({
			id: "edit-person",
			name: "Edit person",
			checkCallback: (checking) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!checking && activeFile) {
					new PersonModal(this.app, activeFile).open();
				}
				return !!activeFile;
			},
		});
	}
}