import { Plugin } from "obsidian";
import { PersonModal } from "modals/person-modal";
import { FAMILY_TREE_VIEW_TYPE } from "view";

export function addCommands(plugin: Plugin): void {
    plugin.addCommand({
        id: "edit-person",
        name: "Edit person",
        checkCallback: (checking) => {
            const activeFile = plugin.app.workspace.getActiveFile();
            if (!checking && activeFile) {
                new PersonModal(plugin.app, activeFile).open();
            }
            return !!activeFile;
        },
    });

    plugin.addCommand({
        id: "open-family-tree-view",
        name: "Open Family Tree View",
        callback: async () => {
            plugin.app.workspace
                    .getLeaf()
                    .setViewState({ type: FAMILY_TREE_VIEW_TYPE });
        },
    });
}