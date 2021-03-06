"use strict";
var LuxKanbanBoard = (function () {
    function LuxKanbanBoard(id, title, showActions) {
        this.id = id;
        this.title = title;
        this.showActions = showActions;
    }
    return LuxKanbanBoard;
}());
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
var LuxKanban = (function () {
    function LuxKanban(targetElementId, boards, options) {
        this.boardItems = [];
        this.mouse_is_up = true;
        var targetElement = document.getElementById(targetElementId);
        if (targetElement === null) {
            throw new Error("LuxKanban: targetElement not found with id '" + targetElementId + "'");
        }
        else {
            this.targetElement = targetElement;
        }
        if (typeof options.endpoints === "undefined" || options.endpoints === null) {
            this.endpoints = { sync: null };
        }
        else {
            this.endpoints = options.endpoints;
        }
        this.boards = boards;
        this.gutter = options.gutter === undefined ? "10px" : options.gutter;
        if (options.boardWidth === undefined || options.autoResponsivePercentageMode) {
            this.boardWidth = 'calc(' + (100 / this.boards.length) + '% - ' + this.gutter + ' - (' + this.gutter + ' / ' + (this.boards.length) + '))';
        }
        else {
            this.boardWidth = options.boardWidth;
        }
        this.onLoad = typeof options.onLoad === "undefined" || options.onLoad === null ? null : options.onLoad;
        this.onSave = typeof options.onSave === "undefined" || options.onSave === null ? null : options.onSave;
        this.onSyncStart = typeof options.onSyncStart === "undefined" || options.onSyncStart === null ? null : options.onSyncStart;
        this.onSyncSuccess = typeof options.onSyncSuccess === "undefined" || options.onSyncSuccess === null ? null : options.onSyncSuccess;
        this.onSyncError = typeof options.onSyncError === "undefined" || options.onSyncError === null ? null : options.onSyncError;
        this.load();
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
            if (board.showActions) {
                var dom_board_new = dom_board_header.appendChild(document.createElement("button"));
                dom_board_new.type = 'button';
                dom_board_new.className = "lux-kanban-board-new";
                dom_board_new.dataset.boardIndex = b.toString();
                dom_board_new.innerText = '+';
                dom_board_new.addEventListener("click", function () {
                    _this.addBoardItem(dom_board_items_container, boardIndex);
                });
            }
            var dom_board_items_container = dom_board.appendChild(document.createElement("div"));
            dom_board_items_container.className = "lux-kanban-board-items-container";
            dom_board_items_container.dataset.boardIndex = b.toString();
            var boardItems = this_1.getBoardItems(b);
            console.log("boardItems", boardItems);
            for (var i = 0; i < boardItems.length; i++) {
                var boardItem = boardItems[i];
                that = this_1.renderBoardItem(board, boardItem, true);
                dom_board_items_container.appendChild(that.dom_boardItem);
                that.after_dom_added();
            }
        };
        var this_1 = this, that;
        for (var b = 0; b < this.boards.length; b++) {
            _loop_1(b);
        }
    };
    LuxKanban.prototype.renderBoardItem = function (board, boardItem, addEvents) {
        var _this = this;
        var dom_boardItem = document.createElement("div");
        dom_boardItem.id = boardItem.id;
        dom_boardItem.className = 'lux-kanban-board-item';
        dom_boardItem.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem.dataset.boardItemPosition = boardItem.position.toString();
        var dom_boardItem_editor = dom_boardItem.appendChild(document.createElement("textarea"));
        dom_boardItem_editor.className = 'lux-kanban-board-item-editor';
        dom_boardItem_editor.dataset.boardIndex = boardItem.boardIndex.toString();
        dom_boardItem_editor.dataset.boardItemPosition = boardItem.position.toString();
        dom_boardItem_editor.innerHTML = boardItem.content;
        if (board.showActions) {
            var dom_boardItem_actionbar = dom_boardItem.appendChild(document.createElement("div"));
            dom_boardItem_actionbar.className = 'lux-kanban-board-item-actionbar';
            var dom_boardItem_delete = dom_boardItem_actionbar.appendChild(document.createElement("button"));
            dom_boardItem_delete.className = 'lux-kanban-board-item-actionbar-item __dialog-btn __dialog-btn-sm __dialog-btn-red';
            dom_boardItem_delete.innerHTML = '&#128465;';
            dom_boardItem_delete.dataset.boardIndex = boardItem.boardIndex.toString();
            dom_boardItem_delete.dataset.boardItemPosition = boardItem.position.toString();
            var dom_boardItem_move_right = dom_boardItem_actionbar.appendChild(document.createElement("button"));
            dom_boardItem_move_right.className = 'lux-kanban-board-item-actionbar-item __dialog-btn __dialog-btn-sm';
            dom_boardItem_move_right.innerHTML = '&#10140;';
            dom_boardItem_move_right.dataset.boardIndex = boardItem.boardIndex.toString();
            dom_boardItem_move_right.dataset.boardItemPosition = boardItem.position.toString();
            if (addEvents) {
                dom_boardItem_delete.addEventListener("click", function (event) {
                    event.preventDefault();
                    _this.deleteBoardItem(dom_boardItem);
                });
                dom_boardItem_move_right.addEventListener("click", function (event) {
                    event.preventDefault();
                    _this.moveBoardItem(boardItem, boardItem.boardIndex + 1, null);
                });
            }
        }
        var after_dom_added = function () {
            if (board.showActions) {
                dom_boardItem_editor.style.width = "calc(100% - " + dom_boardItem_actionbar.offsetWidth + "px)";
                dom_boardItem_editor.style.minHeight = Math.ceil(dom_boardItem_actionbar.offsetHeight) + "px";
            }
            dom_boardItem_editor.style.height = '1px';
            dom_boardItem_editor.style.height = dom_boardItem_editor.scrollHeight + 'px';
        };
        if (addEvents) {
            dom_boardItem_editor.addEventListener("input", function () {
                dom_boardItem_editor.style.height = '1px';
                dom_boardItem_editor.style.height = dom_boardItem_editor.scrollHeight + 'px';
                boardItem.content = dom_boardItem_editor.value.split("<").join("&lt;").split(">").join("&gt;");
            });
            dom_boardItem_editor.addEventListener("change", function () {
                _this.save();
            });
            var mousedown = void 0, mousemove_1, mouseup_1;
            var dom_boardItem_ondrag_1 = null;
            var dom_boardItem_offset_x_1 = 0;
            var dom_boardItem_offset_y_1 = 0;
            var dom_boardItem_timeout_1 = 0;
            mousedown = function () {
                if (_this.mouse_is_up) {
                    dom_boardItem_timeout_1 = setTimeout(function () {
                        _this.mouse_is_up = false;
                        dom_boardItem.classList.add("disabled");
                        var that = _this.renderBoardItem(board, boardItem, true);
                        dom_boardItem_ondrag_1 = document.body.appendChild(that.dom_boardItem);
                        that.after_dom_added();
                        console.log("dom_boardItem_ondrag", dom_boardItem_ondrag_1);
                        document.body.classList.add("lux-kanban-grabbing");
                        dom_boardItem_ondrag_1.classList.add("ondrag");
                        dom_boardItem_ondrag_1.style.position = "fixed";
                        dom_boardItem_ondrag_1.style.display = "none";
                        setTimeout(function () {
                            if (dom_boardItem_ondrag_1 !== null) {
                                dom_boardItem_ondrag_1.style.display = "block";
                            }
                        }, 100);
                        document.body.addEventListener('mousemove', mousemove_1);
                        document.body.addEventListener('touchmove', mousemove_1);
                        dom_boardItem_offset_x_1 = dom_boardItem.offsetWidth / 2;
                        dom_boardItem_offset_y_1 = dom_boardItem.offsetHeight / 2;
                    }, 200);
                }
                document.body.addEventListener("mouseup", mouseup_1);
                document.body.addEventListener("touchend", mouseup_1);
            };
            mousemove_1 = function (e) {
                if (dom_boardItem_ondrag_1 !== null) {
                    dom_boardItem_ondrag_1.style.left = (e.clientX - dom_boardItem_offset_x_1) + "px";
                    dom_boardItem_ondrag_1.style.top = (e.clientY - dom_boardItem_offset_y_1) + "px";
                }
            };
            mouseup_1 = function (e) {
                clearTimeout(dom_boardItem_timeout_1);
                if (!_this.mouse_is_up) {
                    _this.mouse_is_up = true;
                    console.log("mouseup");
                    dom_boardItem.classList.remove("disabled");
                    if (dom_boardItem_ondrag_1 !== null)
                        dom_boardItem_ondrag_1.remove();
                    document.querySelectorAll(".lux-kanban-board-item.ondrag").forEach(function (elem) { elem.remove(); });
                    document.body.classList.remove("lux-kanban-grabbing");
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
                document.body.removeEventListener('mousemove', mousemove_1);
                document.body.removeEventListener('touchmove', mousemove_1);
                document.body.removeEventListener('mouseup', mouseup_1);
                document.body.removeEventListener('touchend', mouseup_1);
            };
            dom_boardItem.addEventListener("mousedown", mousedown);
            dom_boardItem.addEventListener("touchstart", mousedown);
        }
        return { dom_boardItem: dom_boardItem, after_dom_added: after_dom_added };
    };
    LuxKanban.prototype.addBoardItem = function (dom_board_items_container, boardIndex) {
        var board = this.boards[boardIndex];
        var id = "lux-kanban-board-item-" + new Date().getTime();
        var boardItemPosition = this.boardItems.length;
        this.boardItems[boardItemPosition] = new LuxKanbanBoardItem(id, board.id, boardIndex, "", 1);
        var that = this.renderBoardItem(board, this.boardItems[boardItemPosition], true);
        dom_board_items_container.prepend(that.dom_boardItem);
        that.after_dom_added();
        that.dom_boardItem.getElementsByTagName("textarea")[0].focus();
        var boardItems = this.getBoardItems(boardIndex);
        for (var i = 0; i < boardItems.length - 1; i++) {
            boardItems[i].position += 1;
        }
        this.save();
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
        this.save();
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
            this.save();
        }
    };
    LuxKanban.prototype.load = function () {
        var localStorageContent = localStorage.getItem(this.targetElement.id);
        if (localStorageContent !== null) {
            this.boardItems = JSON.parse(localStorageContent);
            if (this.onLoad !== null)
                this.onLoad();
        }
    };
    LuxKanban.prototype.save = function () {
        var data = JSON.stringify(this.boardItems);
        localStorage.setItem(this.targetElement.id, data);
        if (this.onSave !== null)
            this.onSave();
        return data;
    };
    LuxKanban.prototype.sync = function () {
        var _this = this;
        if (this.endpoints.sync !== null) {
            if (this.onSyncStart !== null)
                this.onSyncStart();
            var sentData = "&data=" + this.save();
            this.api_request(this.endpoints.sync, sentData, function (response, xhr) {
                _this.boardItems = response.data;
                if (_this.onSyncSuccess !== null)
                    _this.onSyncSuccess(response, xhr);
            }, function (response, xhr) {
                if (_this.onSyncError !== null)
                    _this.onSyncError(response, xhr);
            });
        }
    };
    LuxKanban.prototype.api_request = function (endpoint, sentData, onDone, onError) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                var response = JSON.parse(xhr.responseText);
                if (this.status == 200) {
                    onDone(response, xhr);
                }
                else {
                    onError(response, xhr);
                }
            }
        };
        xhr.open("POST", endpoint, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(sentData);
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