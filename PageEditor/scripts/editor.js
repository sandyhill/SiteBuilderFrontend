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
                this.isDragging = false;
                this.initListeners();
            }
            Editor.prototype.initListeners = function () {
                var _this = this;
                $("#btn-parallax").on("click", function (e) {
                    _this.isDragging = true;
                    _this.draggingComponent = new ParallaxComponent();
                    _this.dragShadow.find("i").text("panorama");
                    _this.dragShadow.css("display", "block");
                });
                $("#btn-container").on("click", function (e) {
                    _this.isDragging = true;
                    _this.draggingComponent = new GridComponent();
                    _this.dragShadow.find("i").text("line_style");
                    _this.dragShadow.css("display", "block");
                });
                $("#btn-row").on("click", function (e) {
                });
                $("#btn-column").on("click", function (e) {
                });
                $("#btn-table").on("click", function (e) {
                });
                $("#btn-accordion").on("click", function (e) {
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
                $("#");
            };
            return Editor;
        }());
        PageEditor.Editor = Editor;
        (function (ComponentTypes) {
            ComponentTypes[ComponentTypes["PARALLAX"] = 0] = "PARALLAX";
            ComponentTypes[ComponentTypes["GRID"] = 1] = "GRID";
            ComponentTypes[ComponentTypes["ROW"] = 2] = "ROW";
            ComponentTypes[ComponentTypes["COL"] = 3] = "COL";
            ComponentTypes[ComponentTypes["TABLE"] = 4] = "TABLE";
            ComponentTypes[ComponentTypes["ACCORDION"] = 5] = "ACCORDION";
            ComponentTypes[ComponentTypes["HEADER"] = 6] = "HEADER";
            ComponentTypes[ComponentTypes["PARAGRAPH"] = 7] = "PARAGRAPH";
            ComponentTypes[ComponentTypes["LIST"] = 8] = "LIST";
            ComponentTypes[ComponentTypes["PANEL_CARD"] = 9] = "PANEL_CARD";
            ComponentTypes[ComponentTypes["BASIC_CARD"] = 10] = "BASIC_CARD";
            ComponentTypes[ComponentTypes["IMAGE_CARD"] = 11] = "IMAGE_CARD";
            ComponentTypes[ComponentTypes["REVEAL_CARD"] = 12] = "REVEAL_CARD";
            ComponentTypes[ComponentTypes["IMAGE"] = 13] = "IMAGE";
            ComponentTypes[ComponentTypes["GALLERY"] = 14] = "GALLERY";
            ComponentTypes[ComponentTypes["VIDEO"] = 15] = "VIDEO";
            ComponentTypes[ComponentTypes["AUDIO"] = 16] = "AUDIO";
            ComponentTypes[ComponentTypes["STREAM"] = 17] = "STREAM";
            ComponentTypes[ComponentTypes["POST"] = 18] = "POST";
            ComponentTypes[ComponentTypes["REF"] = 19] = "REF";
            ComponentTypes[ComponentTypes["PERSON"] = 20] = "PERSON";
        })(PageEditor.ComponentTypes || (PageEditor.ComponentTypes = {}));
        var ComponentTypes = PageEditor.ComponentTypes;
        var Component = (function () {
            function Component() {
            }
            Component.prototype.onAttached = function (parent) {
                this.parent = parent;
            };
            return Component;
        }());
        PageEditor.Component = Component;
        function isComponent(obj) {
            return obj["element"] != null && obj["getType"] != null;
        }
        PageEditor.isComponent = isComponent;
        var ContainerComponent = (function (_super) {
            __extends(ContainerComponent, _super);
            function ContainerComponent() {
                _super.call(this);
                this.children = new utils_1.collections.LinkedList();
            }
            ContainerComponent.prototype.isContainer = function () {
                return true;
            };
            ContainerComponent.prototype.addChild = function (child, after) {
                if (after !== null) {
                }
            };
            return ContainerComponent;
        }(Component));
        PageEditor.ContainerComponent = ContainerComponent;
        function isContainer(comp) {
            return comp.getType() == ComponentTypes.PARALLAX ||
                comp.getType() == ComponentTypes.GRID ||
                comp.getType() == ComponentTypes.ROW ||
                comp.getType() == ComponentTypes.COL;
        }
        PageEditor.isContainer = isContainer;
        var ParallaxComponent = (function (_super) {
            __extends(ParallaxComponent, _super);
            function ParallaxComponent() {
                _super.call(this);
                this.element = $("<div></div>");
                this.element.addClass("parallax-container");
                var parallax = $("<div></div>");
                parallax.addClass("parallax");
                parallax.css("background", "#000");
                parallax.appendTo(this.element);
                this.imageElement = $("<img></img>");
                this.imageElement.appendTo(parallax);
                this.containerElement = $("<div></div>");
                this.containerElement.addClass("container");
                this.containerElement.appendTo(this.element);
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
        $(document).ready(function () {
        });
    })(PageEditor = exports.PageEditor || (exports.PageEditor = {}));
});
