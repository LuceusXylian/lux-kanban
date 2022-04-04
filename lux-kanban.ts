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
    dom_boards: HTMLElement[] = [];

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
        this.dom_boards = [];

        for (let b = 0; b < this.boards.length; b++) {
            const boardIndex = b;
            const board = this.boards[boardIndex];
            let dom_board = this.targetElement.appendChild( document.createElement("div") );
            dom_board.id = board.id;
            dom_board.className = "lux-kanban-board";
            dom_board.style.width = this.boardWidth;
            dom_board.style.marginLeft = this.gutter;
            dom_board.style.marginBottom = this.gutter;
    

            let dom_board_header = dom_board.appendChild( document.createElement("div") );
            dom_board_header.className = "lux-kanban-board-header";

            let dom_board_title = dom_board_header.appendChild( document.createElement("div") );
            dom_board_title.className = "lux-kanban-board-title";
            dom_board_title.innerText = board.title
            
            let dom_board_new = dom_board_header.appendChild( document.createElement("button") );
            dom_board_new.type = 'button';
            dom_board_new.className = "lux-kanban-board-new";
            dom_board_new.innerText = '+';
            dom_board_new.addEventListener("click", () => {
                this.addBoardItem(dom_board_items_container, boardIndex);
            });

            //TODO: add hotkeys for new item (STRG+E|STRG+N)
            //TODO: add hotkeys for duplicate item (STRG+D)
            

            let dom_board_items_container = dom_board.appendChild( document.createElement("div") );
            dom_board_items_container.className = "lux-kanban-board-items-container";
            for (let i = 0; i < board.items.length; i++) {
                const item = board.items[i];
                dom_board_items_container.appendChild(this.renderBoardItem(item.id, item.content));
            }

            this.dom_boards[this.dom_boards.length] = dom_board;
        }
    }

    renderBoardItem(id: string, content: string): HTMLElement {
        var dom_boardItem = document.createElement("div");
        dom_boardItem.id = id;
        dom_boardItem.className = 'lux-kanban-board-item';
        dom_boardItem.innerHTML = content;

        let dom_boardItem_ondrag: HTMLElement | null = null;
        let dom_boardItem_offset_x: number = 0;
        let dom_boardItem_offset_y: number = 0;
        let dom_boardItem_timeout: number = 0;
        var dragmove = function(e: any){
            if (dom_boardItem_ondrag !== null) {
                dom_boardItem_ondrag.style.left = (e.clientX - dom_boardItem_offset_x)+"px";
                dom_boardItem_ondrag.style.top = (e.clientY - dom_boardItem_offset_y)+"px";
            }
        };

        
        var mouseup_event = (e: MouseEvent) => {
            clearTimeout(dom_boardItem_timeout);

            if (!mouse_is_up) {
                mouse_is_up = true;
                console.log("mouseup")
                dom_boardItem.classList.remove("disabled");
                if(dom_boardItem_ondrag !== null) {
                    dom_boardItem_ondrag.remove();
                }

                // mouseup events on boards and items (drag reciever)
                var elementTarget = document.elementFromPoint(e.clientX, e.clientY);
                if (elementTarget !== null) {
                    console.log("elementTarget", elementTarget);
                    if (elementTarget.tagName === "textarea") {
                        elementTarget = elementTarget.parentElement;
                    }
                }
                //TODO: handle movement

                // kill mouse movement tracking
                document.body.removeEventListener('mousemove', dragmove);
            }
        };



        var mouse_is_up = true;
        dom_boardItem.addEventListener("mousedown", () => {
            if (mouse_is_up) {
                dom_boardItem_timeout = setTimeout(() => {
                    mouse_is_up = false;
                    document.body.dataset.lke_board_item_id = id;

                    dom_boardItem.classList.add("disabled");
                    dom_boardItem_ondrag = document.body.appendChild(this.renderBoardItem(id+"-ondrag", content));
                    dom_boardItem_ondrag.classList.add("ondrag");
                    dom_boardItem_ondrag.style.position = "fixed";
                    dom_boardItem_ondrag.style.display = "none";
                    setTimeout(function() {
                        if(dom_boardItem_ondrag !== null) {
                            dom_boardItem_ondrag.style.display = "block";
                        }
                    }, 100);
        
                    // start mouse movement tracking
                    document.body.addEventListener('mousemove', dragmove);
                    dom_boardItem_offset_x = dom_boardItem.offsetWidth / 2;
                    dom_boardItem_offset_y = dom_boardItem.offsetHeight / 2;
                }, 50);
            
                document.body.addEventListener("mouseup", mouseup_event);
            }
        });

        var dom_boardItem_editor = dom_boardItem.appendChild( document.createElement("textarea") );
        dom_boardItem_editor.className = 'lux-kanban-board-item-editor';
        return dom_boardItem;
    }

    addBoardItem(dom_board_items_container: HTMLElement, boardIndex: number): number {
        var id = "lux-kanban-board-item-" + new Date().getTime();
        var itemIndex = this.boards[boardIndex].items.length;
        this.boards[boardIndex].items[itemIndex] = new LuxKanbanBoardItem(id, "");
        dom_board_items_container.prepend(this.renderBoardItem(id, ""));
        return itemIndex;
    }
}