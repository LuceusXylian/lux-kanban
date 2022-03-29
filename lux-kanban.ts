class LuxKanbanBoardItem {
    id: string;
    content: string;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
    }
}

class LuxKanbanBoard {
    id: string;
    title: string;
    items: LuxKanbanBoardItem[];

    constructor(id: string, title: string, items: []) {
        this.id = id;
        this.title = title;
        this.items = items;
    }
}

class LuxKanban {
    targetElement: HTMLElement;
    boards: LuxKanbanBoard[];
    gutter: string;
    boardWidth: string;

    constructor(targetElementId: string, boards: LuxKanbanBoard[], options: {gutter: string | undefined, boardWidth: string | undefined, autoResponsivePercentageMode: boolean | undefined, }) {
        var targetElement = document.getElementById(targetElementId);
        if (targetElement === null) {
            throw new Error("LuxKanban: targetElement not found with id '"+targetElementId+"'");
        } else {
            this.targetElement = targetElement;
        }

        this.boards = boards;
        this.gutter = options.gutter === undefined? "10px" : options.gutter;

        if (options.boardWidth === undefined || options.autoResponsivePercentageMode) {
            this.boardWidth = 'calc('+(100/this.boards.length)+'% - '+this.gutter+')';
        } else {
            this.boardWidth = options.boardWidth;
        }

        this.render();
    }
    
    render() {
        this.targetElement.innerHTML = '';
        for (let b = 0; b < this.boards.length; b++) {
            const board = this.boards[b];
            let board_dom = this.targetElement.appendChild( document.createElement("div") );
            board_dom.className = "lux-kanban-board";
            board_dom.style.width = this.boardWidth;
            board_dom.style.marginLeft = this.gutter;
            board_dom.style.marginBottom = this.gutter;
    

            let board_dom_header = board_dom.appendChild( document.createElement("div") );
            board_dom_header.className = "lux-kanban-board-header";

            let board_dom_title = board_dom_header.appendChild( document.createElement("div") );
            board_dom_title.className = "lux-kanban-board-title";
            board_dom_title.innerText = board.title
            
            let board_dom_new = board_dom_header.appendChild( document.createElement("button") );
            board_dom_new.type = 'button';
            board_dom_new.className = "lux-kanban-board-new";
            board_dom_new.innerText = '+';
            

            let board_dom_items_container = board_dom.appendChild( document.createElement("div") );
            board_dom_items_container.className = "lux-kanban-board-items-container";
        }
    }
}