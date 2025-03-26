import { Plugin, ItemView, WorkspaceLeaf, IconName } from "obsidian";
import * as d3 from "d3";
import { collectFamilyTree } from "tree-data";

export const FAMILY_TREE_VIEW_TYPE = "family-tree-view";

export function registerView(plugin: Plugin): void {
    plugin.registerView(
        FAMILY_TREE_VIEW_TYPE,
        (leaf) => new FamilyTreeView(leaf)
    );
}

export class FamilyTreeView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getIcon(): IconName {
        return 'heart';
    }

    getViewType(): string {
        return FAMILY_TREE_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Family Tree";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        const svgContainer = container.createEl("div", { attr: { id: "family-tree-container" } });
        this.renderTree(svgContainer);
    }

    async onClose() {

    }

    renderTree(container: HTMLElement) {
        const width = 800;
        const height = 600;

        // Создаём SVG-элемент
        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(50, 50)");

        // Данные для дерева
        const data = {
            name: "Иван Иванов",
            children: [
                {
                    name: "Пётр Иванов",
                    children: [{ name: "Анна Петрова" }, { name: "Дмитрий Петров" }]
                },
                { name: "Мария Иванова" }
            ]
        };

        // Создаём layout-дерево (направление сверху вниз)
        const root = d3.hierarchy(data);
        const treeLayout = d3.tree().size([width - 200, height - 150]);
        treeLayout(root);

        // Функция для создания ортогональных линий
        function diagonal(s: any, d: any) {
            return `M ${s.x},${s.y}
            V ${(s.y + d.y) / 2}
            H ${d.x}
            V ${d.y}`;
        }

        // Рисуем линии-связи (с ортогональными углами)
        svg.selectAll(".link")
            .data(root.links())
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", (d) => diagonal(d.source, d.target))
            .attr("fill", "none")
            .attr("stroke", "var(--background-modifier-border)")
            .attr("stroke-width", 2);

        // Рисуем прямоугольники для узлов
        const node = svg.selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d) => `translate(${d.x},${d.y})`);

        // Прямоугольник с острыми углами и адаптивными цветами
        node.append("rect")
            .attr("width", 120)
            .attr("height", 40)
            .attr("x", -60) // Центрируем прямоугольник по X
            .attr("y", -20) // Центрируем по Y
            .attr("stroke", "var(--background-modifier-border)")
            .attr("fill", "var(--background-primary)")
            .attr("stroke-width", 2);

        // Текст внутри прямоугольника
        node.append("text")
            .attr("dy", 5) // Центр текста по вертикали
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "var(--text-normal)")
            .text((d) => d.data.name);
    }
}
