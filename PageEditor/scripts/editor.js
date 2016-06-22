var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./utils"], function (require, exports, utils_1) {
    "use strict";
    var PageEditor;
    (function (PageEditor) {
        var Editor = (function () {
            function Editor() {
                var _this = this;
                this.isDragging = false;
                this.initListeners();
                this.rootComponent = new RootComponent();
                this.dragShadow = $("#drag-shadow");
                $("main").on("mousemove", function (e) {
                    _this.dragShadow.css("top", e.pageY + 5);
                    _this.dragShadow.css("left", e.pageX + 5);
                });
            }
            Editor.prototype.initListeners = function () {
                var _this = this;
                $("#btn-parallax").on("click", function (e) {
                    _this.startDragging(new ParallaxComponent(), "panorama");
                });
                $("#btn-container").on("click", function (e) {
                    _this.startDragging(new GridComponent(), "line_style");
                });
                $("#btn-row").on("click", function (e) {
                    _this.startDragging(new RowComponent(), "view_stream");
                });
                $("#btn-col").on("click", function (e) {
                    _this.startDragging(new ColComponent(), "view_array");
                });
                $("#btn-table").on("click", function (e) {
                });
                $("#btn-accordion").on("click", function (e) {
                    _this.startDragging(new AccordionComponent(), "view_day");
                });
                //text
                $("#btn-header").on("click", function (e) {
                });
                $("#btn-paragraph").on("click", function (e) {
                });
                $("#btn-list").on("click", function (e) {
                });
                //cards
                $("#btn-card-panel").on("click", function (e) {
                    _this.isDragging = true;
                    //this.draggingComponent = this.createCardPanelComponent();
                    _this.dragShadow.find("i").text("receipt");
                    _this.dragShadow.css("display", "block");
                });
                $("#btn-card-basic").on("click", function (e) {
                });
                $("#btn-card-image").on("click", function (e) {
                });
                $("#btn-card-reveal").on("click", function (e) {
                });
            };
            Editor.prototype.startDragging = function (comp, icon) {
                this.isDragging = true;
                this.draggingComponent = comp;
                this.dragShadow.find("i").text(icon);
                this.dragShadow.css("display", "block");
                this.rootComponent.clearHighlight();
                this.rootComponent.highlightForDropType(comp.getType());
            };
            Editor.prototype.endDrag = function () {
                this.isDragging = false;
                this.draggingComponent = null;
                this.dragShadow.css("display", "none");
                this.rootComponent.clearHighlight();
            };
            return Editor;
        }());
        PageEditor.Editor = Editor;
        (function (ComponentTypes) {
            ComponentTypes[ComponentTypes["ROOT"] = 0] = "ROOT";
            ComponentTypes[ComponentTypes["PARALLAX"] = 1] = "PARALLAX";
            ComponentTypes[ComponentTypes["GRID"] = 2] = "GRID";
            ComponentTypes[ComponentTypes["ROW"] = 3] = "ROW";
            ComponentTypes[ComponentTypes["COL"] = 4] = "COL";
            ComponentTypes[ComponentTypes["TABLE"] = 5] = "TABLE";
            ComponentTypes[ComponentTypes["ACCORDION"] = 6] = "ACCORDION";
            ComponentTypes[ComponentTypes["HEADER"] = 7] = "HEADER";
            ComponentTypes[ComponentTypes["PARAGRAPH"] = 8] = "PARAGRAPH";
            ComponentTypes[ComponentTypes["LIST"] = 9] = "LIST";
            ComponentTypes[ComponentTypes["PANEL_CARD"] = 10] = "PANEL_CARD";
            ComponentTypes[ComponentTypes["BASIC_CARD"] = 11] = "BASIC_CARD";
            ComponentTypes[ComponentTypes["IMAGE_CARD"] = 12] = "IMAGE_CARD";
            ComponentTypes[ComponentTypes["REVEAL_CARD"] = 13] = "REVEAL_CARD";
            ComponentTypes[ComponentTypes["IMAGE"] = 14] = "IMAGE";
            ComponentTypes[ComponentTypes["GALLERY"] = 15] = "GALLERY";
            ComponentTypes[ComponentTypes["VIDEO"] = 16] = "VIDEO";
            ComponentTypes[ComponentTypes["AUDIO"] = 17] = "AUDIO";
            ComponentTypes[ComponentTypes["STREAM"] = 18] = "STREAM";
            ComponentTypes[ComponentTypes["POST"] = 19] = "POST";
            ComponentTypes[ComponentTypes["REF"] = 20] = "REF";
            ComponentTypes[ComponentTypes["PERSON"] = 21] = "PERSON"; // embed
        })(PageEditor.ComponentTypes || (PageEditor.ComponentTypes = {}));
        var ComponentTypes = PageEditor.ComponentTypes;
        var Component = (function () {
            function Component() {
            }
            Component.prototype.onAttached = function (parent) {
                this.parent = parent;
            };
            Component.prototype.onDetached = function () {
                this.parent = null;
            };
            Component.isComponent = function (obj) {
                return obj["element"] != null && obj["getType"] != null;
            };
            return Component;
        }());
        PageEditor.Component = Component;
        var ContainerComponent = (function (_super) {
            __extends(ContainerComponent, _super);
            function ContainerComponent() {
                _super.call(this);
                this.children = new utils_1.collections.LinkedList();
            }
            ContainerComponent.prototype.containerInit = function () {
                //add initial drop target
                new DropTarget(this).element.appendTo(this.containerElement);
            };
            ContainerComponent.prototype.isContainer = function () {
                return true;
            };
            ContainerComponent.prototype.addChild = function (child, after) {
                this.children.add(child);
                child.element.insertAfter(after);
                var targ = new DropTarget(this);
                targ.element.insertAfter(child.element);
            };
            ContainerComponent.prototype.highlightForDropType = function (type) {
                if (this.acceptsChildType(type)) {
                    this.containerElement.children(".drop-target").css("border", "1px solid #0a0");
                }
                utils_1.collections.forEach(this.children, function (comp) {
                    if (ContainerComponent.isContainer(comp)) {
                        comp.highlightForDropType(type);
                        return true;
                    }
                });
            };
            ContainerComponent.prototype.clearHighlight = function () {
                this.containerElement.children(".drop-target").css("border", "");
                utils_1.collections.forEach(this.children, function (comp) {
                    if (ContainerComponent.isContainer(comp)) {
                        comp.clearHighlight();
                        return true;
                    }
                });
            };
            ContainerComponent.isContainer = function (comp) {
                return comp.getType() == ComponentTypes.PARALLAX ||
                    comp.getType() == ComponentTypes.GRID ||
                    comp.getType() == ComponentTypes.ROW ||
                    comp.getType() == ComponentTypes.COL;
            };
            return ContainerComponent;
        }(Component));
        PageEditor.ContainerComponent = ContainerComponent;
        var DropTarget = (function () {
            function DropTarget(cont) {
                var _this = this;
                this.cont = cont;
                this.element = $("<div></div>");
                this.element.addClass("drop-target");
                this.element.on("click", function (e) {
                    var edit = Editor.instance;
                    if (edit.isDragging && _this.cont.acceptsChildType(edit.draggingComponent.getType())) {
                        _this.cont.addChild(edit.draggingComponent, _this.element);
                        edit.endDrag();
                    }
                });
            }
            return DropTarget;
        }());
        var RootComponent = (function (_super) {
            __extends(RootComponent, _super);
            function RootComponent() {
                _super.call(this);
                this.element = $("article#edit-area");
                this.containerElement = this.element;
                this.containerInit();
            }
            RootComponent.prototype.getType = function () {
                return ComponentTypes.ROOT;
            };
            RootComponent.prototype.acceptsChildType = function (type) {
                return type != ComponentTypes.COL;
            };
            RootComponent.prototype.isRoot = function (comp) {
                return comp.getType() == ComponentTypes.ROOT;
            };
            return RootComponent;
        }(ContainerComponent));
        var ParallaxComponent = (function (_super) {
            __extends(ParallaxComponent, _super);
            function ParallaxComponent() {
                _super.call(this);
                this.element = $("<div></div>");
                this.element.addClass("parallax-container");
                this.element.addClass("component");
                var parallax = $("<div></div>");
                parallax.addClass("parallax");
                parallax.css("background", "#000");
                parallax.appendTo(this.element);
                this.imageElement = $("<img></img>");
                this.imageElement.appendTo(parallax);
                this.containerElement = $("<div></div>");
                this.containerElement.addClass("container");
                this.containerElement.appendTo(this.element);
                this.containerInit();
            }
            ParallaxComponent.prototype.getType = function () {
                return ComponentTypes.PARALLAX;
            };
            ParallaxComponent.prototype.acceptsChildType = function (type) {
                return type == ComponentTypes.ROW;
            };
            ParallaxComponent.isParallax = function (comp) {
                return comp.getType() == ComponentTypes.PARALLAX;
            };
            return ParallaxComponent;
        }(ContainerComponent));
        var GridComponent = (function (_super) {
            __extends(GridComponent, _super);
            function GridComponent() {
                _super.call(this);
                this.element = $("<div></div>");
                this.containerElement = this.element;
                this.element.addClass("container");
                this.element.addClass("component");
                this.containerInit();
            }
            GridComponent.prototype.getType = function () {
                return ComponentTypes.GRID;
            };
            GridComponent.prototype.acceptsChildType = function (type) {
                return type == ComponentTypes.ROW;
            };
            GridComponent.isGrid = function (comp) {
                return comp.getType() == ComponentTypes.GRID;
            };
            return GridComponent;
        }(ContainerComponent));
        var RowComponent = (function (_super) {
            __extends(RowComponent, _super);
            function RowComponent() {
                _super.call(this);
                this.element = $("<div></div>");
                this.containerElement = this.element;
                this.element.addClass("row");
                this.element.addClass("component");
                this.containerInit();
            }
            RowComponent.prototype.getType = function () {
                return ComponentTypes.ROW;
            };
            RowComponent.prototype.acceptsChildType = function (type) {
                return type == ComponentTypes.COL;
            };
            RowComponent.isRow = function (comp) {
                return comp.getType() == ComponentTypes.ROW;
            };
            return RowComponent;
        }(ContainerComponent));
        var ColComponent = (function (_super) {
            __extends(ColComponent, _super);
            function ColComponent() {
                _super.call(this);
                this.element = $("<div></div>");
                this.containerElement = this.element;
                this.element.addClass("col");
                this.element.addClass("l3");
                this.element.addClass("m4");
                this.element.addClass("s12");
                this.element.addClass("component");
                this.containerInit();
            }
            ColComponent.prototype.getType = function () {
                return ComponentTypes.COL;
            };
            ColComponent.prototype.acceptsChildType = function (type) {
                return !(type == ComponentTypes.ROW ||
                    type == ComponentTypes.COL ||
                    type == ComponentTypes.PARALLAX);
            };
            ColComponent.isCol = function (comp) {
                return comp.getType() == ComponentTypes.COL;
            };
            return ColComponent;
        }(ContainerComponent));
        /*
        class TableComponent extends ContainerComponent {
          
        }
        */
        var AccordionComponent = (function (_super) {
            __extends(AccordionComponent, _super);
            function AccordionComponent() {
                _super.call(this);
                this.element = $("<ul></ul>");
                this.containerElement = this.element;
                this.children = new utils_1.collections.LinkedList();
                this.element.addClass("collapsible");
                this.element.addClass("component");
                this.element.attr("data-collapsible", "accordion");
            }
            AccordionComponent.prototype.getType = function () {
                return ComponentTypes.ACCORDION;
            };
            AccordionComponent.prototype.isAccordion = function (comp) {
                return comp.getType() == ComponentTypes.ACCORDION;
            };
            AccordionComponent.prototype.isContainer = function () {
                return false;
            };
            return AccordionComponent;
        }(Component));
        var AccordionElement = (function () {
            function AccordionElement() {
            }
            return AccordionElement;
        }());
        var TextComponent = (function (_super) {
            __extends(TextComponent, _super);
            function TextComponent() {
                _super.call(this);
            }
            TextComponent.isTextComponent = function (comp) {
                return comp.getType() == ComponentTypes.HEADER ||
                    comp.getType() == ComponentTypes.PARAGRAPH ||
                    comp.getType() == ComponentTypes.LIST;
            };
            return TextComponent;
        }(Component));
        PageEditor.TextComponent = TextComponent;
        var HeaderComponent = (function (_super) {
            __extends(HeaderComponent, _super);
            function HeaderComponent() {
                _super.call(this);
                this.element = $("<h2></h2>");
                this.element.addClass("component");
            }
            HeaderComponent.prototype.getType = function () {
                return ComponentTypes.HEADER;
            };
            HeaderComponent.prototype.isContainer = function () {
                return false;
            };
            return HeaderComponent;
        }(TextComponent));
        $(document).ready(function () {
            Editor.instance = new Editor();
        });
    })(PageEditor = exports.PageEditor || (exports.PageEditor = {}));
});
