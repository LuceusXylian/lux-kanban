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
        for (var b = 0; b < this.boards.length; b++) {
            var board = this.boards[b];
            var board_dom = this.targetElement.appendChild(document.createElement("div"));
            board_dom.className = "lux-kanban-board";
            board_dom.style.width = this.boardWidth;
            board_dom.style.marginLeft = this.gutter;
            board_dom.style.marginBottom = this.gutter;
            var board_dom_title = board_dom.appendChild(document.createElement("div"));
            board_dom_title.className = "lux-kanban-board-title";
            board_dom_title.innerText = board.title;
            var board_dom_items_container = board_dom_title.appendChild(document.createElement("div"));
            board_dom_items_container.className = "lux-kanban-board-items-container";
        }
    }
    return LuxKanban;
}());
//# sourceMappingURL=lux-kanban.js.map