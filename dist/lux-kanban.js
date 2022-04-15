"use strict";
var LuxKanbanBoardItem = (function () {
    function LuxKanbanBoardItem(id, boardId, boardIndex, content, position) {
        this.id = id;
        this.boardId = boardId;
        this.boardIndex = boardIndex;
        this.content = content;
        this.position = position;
    }
    return LuxKanbanBoardItem;
}());
var LuxKanbanBoard = (function () {
    function LuxKanbanBoard(id, title) {
        this.id = id;
        this.title = title;
    }
    return LuxKanbanBoard;
}());
var LuxKanban = (function () {
    function LuxKanban(targetElementId, boards, boardItems, options) {
        this.mouse_is_up = true;
        var targetElement = document.getElementById(targetElementId);
        if (targetElement === null) {
            throw new Error("LuxKanban: targetElement not found with id '" + targetElementId + "'");
        }
        else {
            this.targetElement = targetElement;
        }
        this.boards = boards;
        this.boardItems = boardItems;
        this.gutter = options.gutter === undefined ? "10px" : options.gutter;
        if (options.boardWidth === undefined || options.autoResponsivePercentageMode) {
            this.boardWidth = 'calc(' + (100 / this.boards.length) + '% - ' + this.gutter + ')';
        }
        else {
            this.boardWidth = options.boardWidth;
        }
        this.render();
    }
    LuxKanban.prototype.render = function () {
        var _this = this;
        this.targetElement.innerHTML = '';
        var _loop_1 = function (b) {
            var boardIndex = b;
            var board = this_1.boards[boardIndex];
            var dom_board = this_1.targetElement.appendChild(document.createElement("div"));
            dom_board.id = board.id;
            dom_board.className = "lux-kanban-board";
            dom_board.dataset.boardIndex = b.toString();
            dom_board.style.width = this_1.boardWidth;
            dom_board.style.marginLeft = this_1.gutter;
            dom_board.style.marginBottom = this_1.gutter;
            dom_board.addEventListener("mouseover", function (event) {
                if (_this.mouse_is_up === false) {
                    event.preventDefault();
                }
            });
            var dom_board_header = dom_board.appendChild(document.createElement("div"));
            dom_board_header.className = "lux-kanban-board-header";
            dom_board_header.dataset.boardIndex = b.toString();
            var dom_board_title = dom_board_header.appendChild(document.createElement("div"));
            dom_board_title.className = "lux-kanban-board-title";
            dom_board_title.dataset.boardIndex = b.toString();
            dom_board_title.innerText = board.title;
            var dom_board_new = dom_board_header.appendChild(document.createElement("button"));
            dom_board_new.type = 'button';
            dom_board_new.className = "lux-kanban-board-new";
            dom_board_new.dataset.boardIndex = b.toString();
            dom_board_new.innerText = '+';
            dom_board_new.addEventListener("click", function () {
                _this.addBoardItem(dom_board_items_container, boardIndex);
            });
            var dom_board_items_container = dom_board.appendChild(document.createElement("div"));
            dom_board_items_container.className = "lux-kanban-board-items-container";
            dom_board_items_container.dataset.boardIndex = b.toString();
            var boardItems = this_1.getBoardItems(b);
            console.log("boardItems", boardItems);
            for (var i = 0; i < boardItems.length; i++) {
                var boardItem = boardItems[i];
                dom_board_items_container.appendChild(this_1.renderBoardItem(boardItem, true));
            }
        };
        var this_1 = this;
        for (var b = 0; b < this.boards.length; b++) {
            _loop_1(b);
        }
    };
    LuxKanban.prototype.renderBoardItem = function (boardItem, addEvents) {
        var _this = this;
        var dom_boardItem = document.createElement("div");
        dom_boardItem.id = boardItem.id;
        dom_boardItem.className = 'lux-kanban-board-item';
        dom_boardItem.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem.dataset.boardItemPosition = boardItem.position.toString();
        var dom_boardItem_delete = dom_boardItem.appendChild(document.createElement("button"));
        dom_boardItem_delete.className = 'lux-kanban-board-item-delete __dialog-btn __dialog-btn-sm __dialog-btn-red';
        dom_boardItem_delete.innerHTML = '&#128465;';
        dom_boardItem_delete.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem_delete.dataset.boardItemPosition = boardItem.position.toString();
        var dom_boardItem_editor = dom_boardItem.appendChild(document.createElement("textarea"));
        dom_boardItem_editor.className = 'lux-kanban-board-item-editor';
        dom_boardItem_editor.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem_editor.dataset.boardItemPosition = boardItem.position.toString();
        dom_boardItem_editor.innerHTML = boardItem.content;
        if (addEvents) {
            dom_boardItem_delete.addEventListener("click", function (event) {
                event.preventDefault();
                _this.deleteBoardItem(dom_boardItem);
            });
            dom_boardItem_editor.addEventListener("input", function () {
                dom_boardItem_editor.style.height = '1px';
                dom_boardItem_editor.style.height = dom_boardItem_editor.scrollHeight + 'px';
                boardItem.content = dom_boardItem_editor.value.split("<").join("&lt;").split(">").join("&gt;");
            });
            var dom_boardItem_ondrag_1 = null;
            var dom_boardItem_offset_x_1 = 0;
            var dom_boardItem_offset_y_1 = 0;
            var dom_boardItem_timeout_1 = 0;
            var dragmove = function (e) {
                if (dom_boardItem_ondrag_1 !== null) {
                    dom_boardItem_ondrag_1.style.left = (e.clientX - dom_boardItem_offset_x_1) + "px";
                    dom_boardItem_ondrag_1.style.top = (e.clientY - dom_boardItem_offset_y_1) + "px";
                }
            };
            var mouseup_event = function (e) {
                clearTimeout(dom_boardItem_timeout_1);
                if (!_this.mouse_is_up) {
                    _this.mouse_is_up = true;
                    console.log("mouseup");
                    dom_boardItem.classList.remove("disabled");
                    if (dom_boardItem_ondrag_1 !== null)
                        dom_boardItem_ondrag_1.remove();
                    document.querySelectorAll(".lux-kanban-board-item.ondrag").forEach(function (elem) { elem.remove(); });
                    var elementTarget = _this.elementFromPoint(e.clientX, e.clientY);
                    if (elementTarget === null) {
                        console.error("[lux-kanban] Oh well bad, elementTarget is null. Uff.");
                    }
                    else {
                        console.log("elementTarget", elementTarget);
                        if (elementTarget === null) {
                            console.error("[lux-kanban] Oh well bad, elementTarget is null. Uff.");
                        }
                        else {
                            var newBoardIndex = _this.parseInt(elementTarget.dataset.boardIndex);
                            var boardItemPosition = _this.parseInt(elementTarget.dataset.boardItemPosition);
                            if (newBoardIndex === null) {
                                console.error("[lux-kanban] Oh well bad, newBoardIndex is null. Uff.");
                            }
                            else {
                                var newPosition = boardItemPosition === null ? null : boardItemPosition - 1;
                                _this.moveBoardItem(boardItem, newBoardIndex, newPosition);
                            }
                        }
                    }
                }
                document.body.removeEventListener('mousemove', dragmove);
                document.body.removeEventListener('mouseup', mouseup_event);
            };
            dom_boardItem.addEventListener("mousedown", function () {
                if (_this.mouse_is_up) {
                    dom_boardItem_timeout_1 = setTimeout(function () {
                        _this.mouse_is_up = false;
                        dom_boardItem.classList.add("disabled");
                        dom_boardItem_ondrag_1 = document.body.appendChild(_this.renderBoardItem(boardItem, false));
                        console.log("dom_boardItem_ondrag", dom_boardItem_ondrag_1);
                        dom_boardItem_ondrag_1.classList.add("ondrag");
                        dom_boardItem_ondrag_1.style.position = "fixed";
                        dom_boardItem_ondrag_1.style.display = "none";
                        setTimeout(function () {
                            if (dom_boardItem_ondrag_1 !== null) {
                                dom_boardItem_ondrag_1.style.display = "block";
                            }
                        }, 100);
                        document.body.addEventListener('mousemove', dragmove);
                        dom_boardItem_offset_x_1 = dom_boardItem.offsetWidth / 2;
                        dom_boardItem_offset_y_1 = dom_boardItem.offsetHeight / 2;
                    }, 100);
                    document.body.addEventListener("mouseup", mouseup_event);
                }
            });
        }
        return dom_boardItem;
    };
    LuxKanban.prototype.addBoardItem = function (dom_board_items_container, boardIndex) {
        var board = this.boards[boardIndex];
        var id = "lux-kanban-board-item-" + new Date().getTime();
        var boardItemPosition = this.boardItems.length;
        this.boardItems[boardItemPosition] = new LuxKanbanBoardItem(id, board.id, boardIndex, "", 1);
        dom_board_items_container.prepend(this.renderBoardItem(this.boardItems[boardItemPosition], true));
        var boardItems = this.getBoardItems(boardIndex);
        for (var i = 0; i < boardItems.length - 1; i++) {
            boardItems[i].position += 1;
        }
        return boardItemPosition;
    };
    LuxKanban.prototype.getBoardItems = function (boardIndex) {
        var board = this.boards[boardIndex];
        var boardItems = [];
        for (var i = 0; i < this.boardItems.length; i++) {
            var boardItem = this.boardItems[i];
            if (boardItem.boardId === board.id) {
                boardItems[boardItems.length] = boardItem;
            }
        }
        return boardItems.sort(function (a, b) {
            return a.position > b.position ? 1 : 0;
        });
    };
    LuxKanban.prototype.deleteBoardItem = function (dom_boardItem) {
        var newBoardItems = [];
        this.boardItems.forEach(function (boardItem) {
            if (boardItem.id !== dom_boardItem.id) {
                newBoardItems.push(boardItem);
            }
        });
        this.boardItems = newBoardItems;
        var delme = document.getElementById(dom_boardItem.id);
        if (delme !== null)
            delme.remove();
    };
    LuxKanban.prototype.moveBoardItem = function (item, newBoardIndex, position) {
        var new_position = position === null ? 1 : position;
        var board = this.boards[newBoardIndex];
        if (item.boardIndex !== newBoardIndex || (item.boardIndex === newBoardIndex && item.position !== position)) {
            var boardItems = this.getBoardItems(newBoardIndex);
            for (var i = 0; i < boardItems.length; i++) {
                if (boardItems[i].position >= new_position) {
                    boardItems[i].position += 1;
                }
            }
            item.position = new_position;
            item.boardId = board.id;
            item.boardIndex = newBoardIndex;
            this.render();
        }
    };
    LuxKanban.prototype.parseInt = function (text) {
        if (typeof text === "undefined")
            return null;
        var tmp = parseInt(text);
        return isNaN(tmp) ? null : tmp;
    };
    LuxKanban.prototype.elementFromPoint = function (x, y) {
        var elem = document.elementFromPoint(x, y);
        return elem;
    };
    return LuxKanban;
}());
//# sourceMappingURL=lux-kanban.js.map