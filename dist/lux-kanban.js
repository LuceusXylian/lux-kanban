"use strict";
var LuxKanbanBoardItem = (function () {
    function LuxKanbanBoardItem(id, content) {
        this.id = id;
        this.content = content;
    }
    return LuxKanbanBoardItem;
}());
var LuxKanbanBoard = (function () {
    function LuxKanbanBoard(id, title, items) {
        this.id = id;
        this.title = title;
        this.items = items;
    }
    return LuxKanbanBoard;
}());
var LuxKanban = (function () {
    function LuxKanban(targetElementId, boards, options) {
        this.dom_boards = [];
        var targetElement = document.getElementById(targetElementId);
        if (targetElement === null) {
            throw new Error("LuxKanban: targetElement not found with id '" + targetElementId + "'");
        }
        else {
            this.targetElement = targetElement;
        }
        this.boards = boards;
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
        this.dom_boards = [];
        var _loop_1 = function (b) {
            var boardIndex = b;
            var board = this_1.boards[boardIndex];
            var dom_board = this_1.targetElement.appendChild(document.createElement("div"));
            dom_board.id = board.id;
            dom_board.className = "lux-kanban-board";
            dom_board.style.width = this_1.boardWidth;
            dom_board.style.marginLeft = this_1.gutter;
            dom_board.style.marginBottom = this_1.gutter;
            var dom_board_header = dom_board.appendChild(document.createElement("div"));
            dom_board_header.className = "lux-kanban-board-header";
            var dom_board_title = dom_board_header.appendChild(document.createElement("div"));
            dom_board_title.className = "lux-kanban-board-title";
            dom_board_title.innerText = board.title;
            var dom_board_new = dom_board_header.appendChild(document.createElement("button"));
            dom_board_new.type = 'button';
            dom_board_new.className = "lux-kanban-board-new";
            dom_board_new.innerText = '+';
            dom_board_new.addEventListener("click", function () {
                _this.addBoardItem(dom_board_items_container, boardIndex);
            });
            var dom_board_items_container = dom_board.appendChild(document.createElement("div"));
            dom_board_items_container.className = "lux-kanban-board-items-container";
            for (var i = 0; i < board.items.length; i++) {
                var item = board.items[i];
                dom_board_items_container.appendChild(this_1.renderBoardItem(item.id, item.content));
            }
            this_1.dom_boards[this_1.dom_boards.length] = dom_board;
        };
        var this_1 = this;
        for (var b = 0; b < this.boards.length; b++) {
            _loop_1(b);
        }
    };
    LuxKanban.prototype.renderBoardItem = function (id, content) {
        var _this = this;
        var dom_boardItem = document.createElement("div");
        dom_boardItem.id = id;
        dom_boardItem.className = 'lux-kanban-board-item';
        dom_boardItem.innerHTML = content;
        var dom_boardItem_ondrag = null;
        var dom_boardItem_offset_x = 0;
        var dom_boardItem_offset_y = 0;
        var dom_boardItem_timeout = 0;
        var dragmove = function (e) {
            if (dom_boardItem_ondrag !== null) {
                dom_boardItem_ondrag.style.left = (e.clientX - dom_boardItem_offset_x) + "px";
                dom_boardItem_ondrag.style.top = (e.clientY - dom_boardItem_offset_y) + "px";
            }
        };
        var mouseup_event = function () {
            clearTimeout(dom_boardItem_timeout);
            if (!mouse_is_up) {
                mouse_is_up = true;
                console.log("mouseup");
                dom_boardItem.classList.remove("disabled");
                if (dom_boardItem_ondrag !== null) {
                    dom_boardItem_ondrag.remove();
                }
                document.body.removeEventListener('mousemove', dragmove);
            }
        };
        var mouse_is_up = true;
        dom_boardItem.addEventListener("mousedown", function () {
            if (mouse_is_up) {
                dom_boardItem_timeout = setTimeout(function () {
                    mouse_is_up = false;
                    dom_boardItem.classList.add("disabled");
                    dom_boardItem_ondrag = document.body.appendChild(_this.renderBoardItem(id + "-ondrag", content));
                    dom_boardItem_ondrag.classList.add("ondrag");
                    dom_boardItem_ondrag.style.position = "fixed";
                    document.body.addEventListener('mousemove', dragmove);
                    dom_boardItem_offset_x = dom_boardItem.offsetWidth / 2;
                    dom_boardItem_offset_y = dom_boardItem.offsetHeight / 2;
                }, 50);
                document.body.addEventListener("mouseup", mouseup_event);
            }
        });
        var dom_boardItem_editor = dom_boardItem.appendChild(document.createElement("textarea"));
        dom_boardItem_editor.className = 'lux-kanban-board-item-editor';
        return dom_boardItem;
    };
    LuxKanban.prototype.addBoardItem = function (dom_board_items_container, boardIndex) {
        var id = "lux-kanban-board-item-" + new Date().getTime();
        var itemIndex = this.boards[boardIndex].items.length;
        this.boards[boardIndex].items[itemIndex] = new LuxKanbanBoardItem(id, "");
        dom_board_items_container.prepend(this.renderBoardItem(id, ""));
        return itemIndex;
    };
    return LuxKanban;
}());
//# sourceMappingURL=lux-kanban.js.map