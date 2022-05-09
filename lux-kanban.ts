class LuxKanbanBoard {
    id: string;
    title: string;
    showActions: boolean

    constructor(id: string, title: string, showActions: boolean) {
        this.id = id;
        this.title = title;
        this.showActions = showActions;
    }
}

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

class LuxKanban {
    targetElement: HTMLElement;
    endpoints: { sync: string|null };

    boards: LuxKanbanBoard[];
    boardItems: LuxKanbanBoardItem[] = [];
    gutter: string;
    boardWidth: string;

    onLoad: Function|null;
    onSave: Function|null;
    onSyncStart: Function|null;
    onSyncSuccess: Function|null;
    onSyncError: Function|null;

    mouse_is_up = true;


    constructor(targetElementId: string, boards: LuxKanbanBoard[], 
            options: { 
                endpoints: { sync: string|null },
                gutter: string | undefined, boardWidth: string | undefined, autoResponsivePercentageMode: boolean | undefined,
                onLoad: Function|null, onSave: Function|null, onSyncStart: Function|null, onSyncSuccess: Function|null, onSyncError: Function|null
            }
        ) {
        // Target Element definition
        var targetElement = document.getElementById(targetElementId);
        if (targetElement === null) {
            throw new Error("LuxKanban: targetElement not found with id '"+targetElementId+"'");
        } else {
            this.targetElement = targetElement;
        }

        // API Endpoints definition
        if (typeof options.endpoints === "undefined" || options.endpoints === null) {
            this.endpoints = { sync: null };
        } else {
            this.endpoints = options.endpoints;
        }

        // Boards definition
        this.boards = boards;
        this.gutter = options.gutter === undefined? "10px" : options.gutter;

        if (options.boardWidth === undefined || options.autoResponsivePercentageMode) {
            this.boardWidth = 'calc('+(100/this.boards.length)+'% - '+this.gutter+' - ('+this.gutter+' / '+(this.boards.length)+'))';
        } else {
            this.boardWidth = options.boardWidth;
        }

        // Events definition
        this.onLoad = typeof options.onLoad === "undefined" || options.onLoad === null? null : options.onLoad;
        this.onSave = typeof options.onSave === "undefined" || options.onSave === null? null : options.onSave;
        this.onSyncStart = typeof options.onSyncStart === "undefined" || options.onSyncStart === null? null : options.onSyncStart;
        this.onSyncSuccess = typeof options.onSyncSuccess === "undefined" || options.onSyncSuccess === null? null : options.onSyncSuccess;
        this.onSyncError = typeof options.onSyncError === "undefined" || options.onSyncError === null? null : options.onSyncError;

        this.load();
        this.render();
    }
    
    render() {
        this.targetElement.innerHTML = '';

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
                }
            });
    

            let dom_board_header = dom_board.appendChild( document.createElement("div") );
            dom_board_header.className = "lux-kanban-board-header";
            dom_board_header.dataset.boardIndex = b.toString();

            let dom_board_title = dom_board_header.appendChild( document.createElement("div") );
            dom_board_title.className = "lux-kanban-board-title";
            dom_board_title.dataset.boardIndex = b.toString();
            dom_board_title.innerText = board.title
            
            if (board.showActions) {
                let dom_board_new = dom_board_header.appendChild( document.createElement("button") );
                dom_board_new.type = 'button';
                dom_board_new.className = "lux-kanban-board-new";
                dom_board_new.dataset.boardIndex = b.toString();
                dom_board_new.innerText = '+';
                dom_board_new.addEventListener("click", () => {
                    this.addBoardItem(dom_board_items_container, boardIndex);
                });
            }

            //TODO: add hotkeys for new item (STRG+E|STRG+N)
            //TODO: add hotkeys for duplicate item (STRG+D)
            

            let dom_board_items_container = dom_board.appendChild( document.createElement("div") );
            dom_board_items_container.className = "lux-kanban-board-items-container";
            dom_board_items_container.dataset.boardIndex = b.toString();

            const boardItems = this.getBoardItems(b);
            console.log("boardItems", boardItems);
            for (let i = 0; i < boardItems.length; i++) {
                const boardItem = boardItems[i];
                var that = this.renderBoardItem(board, boardItem, true);
                dom_board_items_container.appendChild(that.dom_boardItem);
                that.after_dom_added();
            }

        }

    }

    renderBoardItem(board: LuxKanbanBoard, boardItem: LuxKanbanBoardItem, addEvents: boolean): { dom_boardItem: HTMLElement, after_dom_added: Function } {
        var dom_boardItem = document.createElement("div");
        dom_boardItem.id = boardItem.id;
        dom_boardItem.className = 'lux-kanban-board-item';
        dom_boardItem.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem.dataset.boardItemPosition = boardItem.position.toString();

        var dom_boardItem_editor = dom_boardItem.appendChild( document.createElement("textarea") );
        dom_boardItem_editor.className = 'lux-kanban-board-item-editor';
        dom_boardItem_editor.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem_editor.dataset.boardItemPosition = boardItem.position.toString();
        dom_boardItem_editor.innerHTML = boardItem.content;
        
        if (board.showActions) {
            var dom_boardItem_actionbar = dom_boardItem.appendChild( document.createElement("div") );
            dom_boardItem_actionbar.className = 'lux-kanban-board-item-actionbar';

            var dom_boardItem_delete = dom_boardItem_actionbar.appendChild( document.createElement("button") );
            dom_boardItem_delete.className = 'lux-kanban-board-item-actionbar-item __dialog-btn __dialog-btn-sm __dialog-btn-red';
            dom_boardItem_delete.innerHTML = '&#128465;';
            dom_boardItem_delete.dataset.boardIndex = boardItem.boardIndex.toString();
            dom_boardItem_delete.dataset.boardItemPosition = boardItem.position.toString();
            
            var dom_boardItem_move_right = dom_boardItem_actionbar.appendChild( document.createElement("button") );
            dom_boardItem_move_right.className = 'lux-kanban-board-item-actionbar-item __dialog-btn __dialog-btn-sm';
            dom_boardItem_move_right.innerHTML = '&#10140;';
            dom_boardItem_move_right.dataset.boardIndex = boardItem.boardIndex.toString();
            dom_boardItem_move_right.dataset.boardItemPosition = boardItem.position.toString();
            

            if (addEvents) {
                dom_boardItem_delete.addEventListener("click", (event: MouseEvent) => {
                    event.preventDefault();
                    this.deleteBoardItem(dom_boardItem);    
                });

                dom_boardItem_move_right.addEventListener("click", (event: MouseEvent) => {
                    event.preventDefault();
                    this.moveBoardItem(boardItem, boardItem.boardIndex +1, null);
                });
            }
        }

        // render height correctly by setting the height after element is added to the DOM
        var after_dom_added = () => {
            if (board.showActions) {
                dom_boardItem_editor.style.width = "calc(100% - "+dom_boardItem_actionbar.offsetWidth+"px)";
                dom_boardItem_editor.style.minHeight = Math.ceil(dom_boardItem_actionbar.offsetHeight)+"px";
            }
            dom_boardItem_editor.style.height = '1px';
            dom_boardItem_editor.style.height = dom_boardItem_editor.scrollHeight + 'px';
        };



        if (addEvents) {
            dom_boardItem_editor.addEventListener("input", function() {
                dom_boardItem_editor.style.height = '1px';
                dom_boardItem_editor.style.height = dom_boardItem_editor.scrollHeight + 'px';
                boardItem.content = dom_boardItem_editor.value.split("<").join("&lt;").split(">").join("&gt;");
            });

            dom_boardItem_editor.addEventListener("change", () => {
                this.save();
            });


            let mousedown: any, mousemove: any, mouseup: any;
            let dom_boardItem_ondrag: HTMLElement | null = null;
            let dom_boardItem_offset_x: number = 0;
            let dom_boardItem_offset_y: number = 0;
            let dom_boardItem_timeout: number = 0;

            mousedown = () => {
                if (this.mouse_is_up) {
                    dom_boardItem_timeout = setTimeout(() => {
                        this.mouse_is_up = false;

                        dom_boardItem.classList.add("disabled");
                        
                        var that = this.renderBoardItem(board, boardItem, true);
                        dom_boardItem_ondrag = document.body.appendChild(that.dom_boardItem);
                        that.after_dom_added();
        

                        console.log("dom_boardItem_ondrag", dom_boardItem_ondrag);
                        document.body.classList.add("lux-kanban-grabbing");
                        dom_boardItem_ondrag.classList.add("ondrag");
                        dom_boardItem_ondrag.style.position = "fixed";
                        dom_boardItem_ondrag.style.display = "none";
                        setTimeout(function() {
                            if(dom_boardItem_ondrag !== null) {
                                dom_boardItem_ondrag.style.display = "block";
                            }
                        }, 100);
            
                        // start mouse movement tracking
                        document.body.addEventListener('mousemove', mousemove);
                        document.body.addEventListener('touchmove', mousemove);
                        dom_boardItem_offset_x = dom_boardItem.offsetWidth / 2;
                        dom_boardItem_offset_y = dom_boardItem.offsetHeight / 2;
                    }, 200);
                }
            
                document.body.addEventListener("mouseup", mouseup);
                document.body.addEventListener("touchend", mouseup);
            };


            mousemove = (e: MouseEvent) => {
                if (dom_boardItem_ondrag !== null) {
                    dom_boardItem_ondrag.style.left = (e.clientX - dom_boardItem_offset_x)+"px";
                    dom_boardItem_ondrag.style.top = (e.clientY - dom_boardItem_offset_y)+"px";
                    //TODO: drop preview
                }
            };

            mouseup = (e: MouseEvent) => {
                clearTimeout(dom_boardItem_timeout);

                if (!this.mouse_is_up) {
                    this.mouse_is_up = true;
                    console.log("mouseup")
                    dom_boardItem.classList.remove("disabled");
                    if(dom_boardItem_ondrag !== null) dom_boardItem_ondrag.remove();
                    document.querySelectorAll(".lux-kanban-board-item.ondrag").forEach((elem) => { elem.remove() });
                    document.body.classList.remove("lux-kanban-grabbing");

                    // mouseup events on boards and items (drag reciever)
                    var elementTarget: HTMLElement | null = this.elementFromPoint(e.clientX, e.clientY);
                    if (elementTarget === null) {
                        console.error("[lux-kanban] Oh well bad, elementTarget is null. Uff.");
                    } else {
                        console.log("elementTarget", elementTarget);

                        // handle movement
                        if (elementTarget === null) {
                            console.error("[lux-kanban] Oh well bad, elementTarget is null. Uff.");
                        } else {
                            var newBoardIndex: number | null = this.parseInt(elementTarget.dataset.boardIndex);
                            var boardItemPosition: number | null = this.parseInt(elementTarget.dataset.boardItemPosition);
            
                            if (newBoardIndex === null) {
                                console.error("[lux-kanban] Oh well bad, newBoardIndex is null. Uff.");
                            } else {
                                var newPosition: number | null = boardItemPosition === null? null : boardItemPosition -1;
                                this.moveBoardItem(boardItem, newBoardIndex, newPosition);
                            }
                        }
                    }
                }

                // kill mouse movement tracking
                document.body.removeEventListener('mousemove', mousemove);
                document.body.removeEventListener('touchmove', mousemove);
                document.body.removeEventListener('mouseup', mouseup);
                document.body.removeEventListener('touchend', mouseup);
            };


            dom_boardItem.addEventListener("mousedown", mousedown);
            dom_boardItem.addEventListener("touchstart", mousedown);

        }

        return { dom_boardItem: dom_boardItem, after_dom_added: after_dom_added };
    }

    addBoardItem(dom_board_items_container: HTMLElement, boardIndex: number): number {
        const board = this.boards[boardIndex];

        var id = "lux-kanban-board-item-" + new Date().getTime();
        var boardItemPosition = this.boardItems.length;
        this.boardItems[boardItemPosition] = new LuxKanbanBoardItem(id, board.id, boardIndex, "", 1);
        
        var that = this.renderBoardItem(board, this.boardItems[boardItemPosition], true);
        dom_board_items_container.prepend(that.dom_boardItem);
        that.after_dom_added();
        that.dom_boardItem.getElementsByTagName("textarea")[0].focus();
        
        // all boardItems of current board except latest ADD position +1
        var boardItems = this.getBoardItems(boardIndex);
        for (let i = 0; i < boardItems.length -1; i++) {
            boardItems[i].position += 1;
        }

        this.save();
        return boardItemPosition;
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

    deleteBoardItem(dom_boardItem: HTMLElement) {
        var newBoardItems: LuxKanbanBoardItem[] = [];
        this.boardItems.forEach((boardItem) => {
            if (boardItem.id !== dom_boardItem.id) {
                newBoardItems.push(boardItem);
            }    
        });
        this.boardItems = newBoardItems;

        var delme = document.getElementById(dom_boardItem.id);
        if(delme !== null) delme.remove();
        this.save();
    }

    moveBoardItem(item: LuxKanbanBoardItem, newBoardIndex: number, position: number | null) {
        var new_position: number = position === null? 1 : position;
        const board = this.boards[newBoardIndex];
        
        if (item.boardIndex !== newBoardIndex || (item.boardIndex === newBoardIndex && item.position !== position)) {
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
            this.save();
        }
    }

    load() {
        var localStorageContent = localStorage.getItem(this.targetElement.id);
        if (localStorageContent !== null) {
            this.boardItems = JSON.parse(localStorageContent);
            if(this.onLoad !== null) this.onLoad();
        }
    }

    save() {
        var data = JSON.stringify(this.boardItems);
        localStorage.setItem(this.targetElement.id, data);
        if(this.onSave !== null) this.onSave();
        return data;
    }

    // Sync method is called on save and load, so data can be loaded and saved from/to the backend.
    // If a API endpoint for the sync method had been proveded, otherwise this method will do nothing.
    sync() {
        if (this.endpoints.sync !== null) {
            if(this.onSyncStart !== null) this.onSyncStart();

            var sentData = "&data="+this.save();

            this.api_request(this.endpoints.sync, sentData, 
                (response: any, xhr: XMLHttpRequest) => {
                    this.boardItems = response.data;
                    if(this.onSyncSuccess !== null) this.onSyncSuccess(response, xhr);
                }, (response: any, xhr: XMLHttpRequest) => {
                    if(this.onSyncError !== null) this.onSyncError(response, xhr);
                }
            );
        }
    }

    api_request(endpoint: string, sentData: string, onDone: Function, onError: Function) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                var response = JSON.parse(xhr.responseText);
                if (this.status == 200) {
                    onDone(response, xhr);
                } else {
                    onError(response, xhr);
                }    
            }
        };
        
        xhr.open("POST", endpoint, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(sentData); 
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