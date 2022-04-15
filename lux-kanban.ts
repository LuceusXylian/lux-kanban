class LuxKanbanBoardItem {
    id: string;
    boardId: string;
    boardIndex: number;
    content: string;
    position: number;

    constructor(id: string, boardId: string, boardIndex: number, content: string, position: number) {
        this.id = id;
        this.boardId = boardId;
        this.boardIndex = boardIndex;
        this.content = content;
        this.position = position;
    }
}

class LuxKanbanBoard {
    id: string;
    title: string;

    constructor(id: string, title: string) {
        this.id = id;
        this.title = title;
    }
}

class LuxKanban {
    targetElement: HTMLElement;
    dom_boardItemContainers: HTMLElement[] = [];

    boards: LuxKanbanBoard[];
    boardItems: LuxKanbanBoardItem[];
    gutter: string;
    boardWidth: string;

    mouse_is_up = true;


    constructor(targetElementId: string, boards: LuxKanbanBoard[], boardItems: LuxKanbanBoardItem[], options: {gutter: string | undefined, boardWidth: string | undefined, autoResponsivePercentageMode: boolean | undefined, }) {
        var targetElement = document.getElementById(targetElementId);
        if (targetElement === null) {
            throw new Error("LuxKanban: targetElement not found with id '"+targetElementId+"'");
        } else {
            this.targetElement = targetElement;
        }

        this.boards = boards;
        this.boardItems = boardItems;
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
        this.dom_boardItemContainers = [];

        for (let b = 0; b < this.boards.length; b++) {
            const boardIndex = b;
            const board = this.boards[boardIndex];
            let dom_board = this.targetElement.appendChild( document.createElement("div") );
            dom_board.id = board.id;
            dom_board.className = "lux-kanban-board";
            dom_board.dataset.boardIndex = b.toString();
            dom_board.style.width = this.boardWidth;
            dom_board.style.marginLeft = this.gutter;
            dom_board.style.marginBottom = this.gutter;
            dom_board.addEventListener("mouseover", (event: MouseEvent) => {
                if (this.mouse_is_up === false) {
                    event.preventDefault();
                    console.log("mouseover", event.target);
                }
            });
    

            let dom_board_header = dom_board.appendChild( document.createElement("div") );
            dom_board_header.className = "lux-kanban-board-header";
            dom_board_header.dataset.boardIndex = b.toString();

            let dom_board_title = dom_board_header.appendChild( document.createElement("div") );
            dom_board_title.className = "lux-kanban-board-title";
            dom_board_title.dataset.boardIndex = b.toString();
            dom_board_title.innerText = board.title
            
            let dom_board_new = dom_board_header.appendChild( document.createElement("button") );
            dom_board_new.type = 'button';
            dom_board_new.className = "lux-kanban-board-new";
            dom_board_new.dataset.boardIndex = b.toString();
            dom_board_new.innerText = '+';
            dom_board_new.addEventListener("click", () => {
                this.addBoardItem(dom_board_items_container, boardIndex);
            });

            //TODO: add hotkeys for new item (STRG+E|STRG+N)
            //TODO: add hotkeys for duplicate item (STRG+D)
            

            let dom_board_items_container = dom_board.appendChild( document.createElement("div") );
            dom_board_items_container.className = "lux-kanban-board-items-container";
            dom_board_items_container.dataset.boardIndex = b.toString();

            var boardItems = this.getBoardItems(b);
            for (let i = 0; i < boardItems.length; i++) {
                const item = boardItems[i];
                dom_board_items_container.appendChild(this.renderBoardItem(i));
            }

            this.dom_boardItemContainers[this.dom_boardItemContainers.length] = dom_board_items_container;
        }

    }

    renderBoardItem(boardItemIndex: number): HTMLElement {
        var boardItem = this.boardItems[boardItemIndex];

        var dom_boardItem = document.createElement("div");
        dom_boardItem.id = boardItem.id;
        dom_boardItem.className = 'lux-kanban-board-item';
        dom_boardItem.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem.dataset.boardItemIndex = boardItemIndex.toString();

        var dom_boardItem_editor = dom_boardItem.appendChild( document.createElement("textarea") );
        dom_boardItem_editor.className = 'lux-kanban-board-item-editor';
        dom_boardItem_editor.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem_editor.dataset.boardItemIndex = boardItemIndex.toString();
        dom_boardItem_editor.innerHTML = boardItem.content;
        dom_boardItem_editor.addEventListener("input", function() {
            dom_boardItem_editor.style.height = '1px';
            dom_boardItem_editor.style.height = dom_boardItem_editor.scrollHeight + 'px';
            boardItem.content = dom_boardItem_editor.value.split("<").join("&lt;").split(">").join("&gt;");
        });


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

        //TODO: drop preview
        var mouseup_event = (e: MouseEvent) => {
            clearTimeout(dom_boardItem_timeout);

            if (!this.mouse_is_up) {
                this.mouse_is_up = true;
                console.log("mouseup")
                dom_boardItem.classList.remove("disabled");
                if(dom_boardItem_ondrag !== null) dom_boardItem_ondrag.remove();
                document.querySelectorAll(".lux-kanban-board-item.ondrag").forEach((elem) => { elem.remove() });

                // mouseup events on boards and items (drag reciever)
                var elementTarget: HTMLElement | null = this.elementFromPoint(e.clientX, e.clientY);
                if (elementTarget === null) {
                    console.error("[lux-kanban] Oh well bad, elementTarget is null. Uff.");
                } else {
                    console.log("elementTarget", elementTarget);

                    //TODO: handle movement
                    if (elementTarget === null) {
                        console.error("[lux-kanban] Oh well bad, elementTarget is null. Uff.");
                    } else {
                        var newBoardIndex: number | null = this.parseInt(elementTarget.dataset.boardIndex);
                        var boardItemIndex: number | null = this.parseInt(elementTarget.dataset.boardItemIndex);
        
                        if (newBoardIndex === null) {
                            console.error("[lux-kanban] Oh well bad, newBoardIndex is null. Uff.");
                        } else {
                            var newPosition: number | null = boardItemIndex === null? null : this.boardItems[boardItemIndex].position -1;
                            this.moveBoardItem(boardItem, newBoardIndex, newPosition);
                        }
                    }
                }
                

                // kill mouse movement tracking
                document.body.removeEventListener('mousemove', dragmove);
            }
        };



        dom_boardItem.addEventListener("mousedown", () => {
            if (this.mouse_is_up) {
                dom_boardItem_timeout = setTimeout(() => {
                    this.mouse_is_up = false;

                    dom_boardItem.classList.add("disabled");
                    dom_boardItem_ondrag = document.body.appendChild(this.renderBoardItem(boardItemIndex));
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
                }, 100);
            
                document.body.addEventListener("mouseup", mouseup_event);
            }
        });

        return dom_boardItem;
    }

    getBoardItems(boardIndex: number): LuxKanbanBoardItem[] {
        const board = this.boards[boardIndex];
        var boardItems: LuxKanbanBoardItem[] = [];

        for (let i = 0; i < this.boardItems.length; i++) {
            const boardItem = this.boardItems[i];
            if (boardItem.boardId === board.id) {
                boardItems[boardItems.length] = boardItem;
            }
        }

        return boardItems.sort(function(a: LuxKanbanBoardItem, b: LuxKanbanBoardItem) {
            return a.position > b.position? 1 : 0;
        });
    }

    addBoardItem(dom_board_items_container: HTMLElement, boardIndex: number): number {
        const board = this.boards[boardIndex];

        var id = "lux-kanban-board-item-" + new Date().getTime();
        var boardItemIndex = this.boardItems.length;
        this.boardItems[boardItemIndex] = new LuxKanbanBoardItem(id, board.id, boardIndex, "", 1);
        dom_board_items_container.prepend(this.renderBoardItem(boardItemIndex));
        
        // all boardItems of current board except latest ADD position +1
        var boardItems = this.getBoardItems(boardIndex);
        for (let i = 0; i < boardItems.length -1; i++) {
            boardItems[i].position += 1;
        }

        return boardItemIndex;
    }

    moveBoardItem(item: LuxKanbanBoardItem, newBoardIndex: number, position: number | null) {
        var new_position: number = position === null? 1 : position;
        const board = this.boards[newBoardIndex];
        
        if (item.boardIndex !== newBoardIndex && item.position !== position) {
            // all boardItems of current board is greater OR equels new_position ADD position +1
            var boardItems = this.getBoardItems(newBoardIndex);
            for (let i = 0; i < boardItems.length; i++) {
                if(boardItems[i].position >= new_position) {
                    boardItems[i].position += 1;
                }
            }
    
            item.position = new_position;
            item.boardId = board.id;
            item.boardIndex = newBoardIndex;
            this.render();
        }
    }


    parseInt(text: string | undefined): number | null {
        if(typeof text === "undefined") return null;
        var tmp = parseInt(text);
        return isNaN(tmp)? null : tmp;
    }

    elementFromPoint(x: number, y: number): HTMLElement | null {
        var elem: any = document.elementFromPoint(x, y);
        return elem;
    }
}