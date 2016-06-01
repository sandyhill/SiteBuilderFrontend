import { collections as collections } from "./utils";

export module PageEditor {
  export class Editor {
    public isDragging: boolean = false;
    public draggingComponent: Component;
    private dragShadow: JQuery;
    
    constructor() {
      this.initListeners();
    }
    
    private initListeners(): void {
      $("#btn-parallax").on("click", (e: Event) => {
        this.isDragging = true;
        this.draggingComponent = new ParallaxComponent();
        this.dragShadow.find("i").text("panorama");
        this.dragShadow.css("display", "block");
        
      });
      $("#btn-container").on("click", (e: Event) => {
        this.isDragging = true;
        this.draggingComponent = new GridComponent();
        this.dragShadow.find("i").text("line_style");
        this.dragShadow.css("display", "block");
        
      });
      $("#btn-row").on("click", (e: Event) => {
        this.isDragging = true;
        this.draggingComponent = new RowComponent();
        this.dragShadow.find("i").text("view_stream");
        this.dragShadow.css("display", "block");
        
      });
      $("#btn-column").on("click", (e: Event) => {
        this.isDragging = true;
        this.draggingComponent = new ColComponent();
        this.dragShadow.find("i").text("view_array");
        this.dragShadow.css("display", "block");
        
      });
      $("#btn-table").on("click", (e: Event) => {
        
      });
      $("#btn-accordion").on("click", (e: Event) => {
        
      });

      //text
      $("#btn-header").on("click", (e: Event) => {
        
      });
      $("#btn-paragraph").on("click", (e: Event) => {
        
      });
      $("#btn-list").on("click", (e: Event) => {
        
      });

      //cards
      $("#btn-card-panel").on("click", (e: Event) => {
        this.isDragging = true;
        //this.draggingComponent = this.createCardPanelComponent();
        this.dragShadow.find("i").text("receipt");
        this.dragShadow.css("display", "block");
      });
      $("#btn-card-basic").on("click", (e: Event) => {
        
      });
      $("#btn-card-image").on("click", (e: Event) => {
        
      });
      $("#btn-card-reveal").on("click", (e: Event) => {
        
      });
    }
    
    public endDrag(): void {
      this.isDragging  = false;
      this.draggingComponent = null;
      this.dragShadow.css("display", "none");
    }
    
    public static instance: Editor;
  }
  
  export enum ComponentTypes {
    PARALLAX, GRID, ROW, COL, TABLE, ACCORDION,     // structural
    HEADER, PARAGRAPH, LIST,                        // text
    PANEL_CARD, BASIC_CARD, IMAGE_CARD, REVEAL_CARD,// cards
    IMAGE, GALLERY, VIDEO, AUDIO,                   // media
    STREAM, POST, REF, PERSON                       // embed
  }
  
  export abstract class Component {
    
    protected parent: ContainerComponent;
    
    protected element: JQuery;
    
    constructor() {
      
    }
    
    public abstract isContainer(): boolean;
    
    public abstract getType(): ComponentTypes;

    public onAttached(parent: ContainerComponent): void {
      this.parent = parent;
    }

    public onDetached(): void {
      this.parent = null;
    }

    public static isComponent(obj: any): obj is Component {
      return obj["element"] != null && obj["getType"] != null;
    }
  }
  
  export abstract class ContainerComponent extends Component {
    
    protected containerElement: JQuery;
    
    //children are NOT stored in order
    private children: collections.List<Component>;
    
    constructor() {
      super();
      this.children = new collections.LinkedList<Component>();
    }
    
    protected containerInit(): void {
      //add initial drop target
      new DropTarget(this).element.appendTo(this.containerElement);
    }

    public isContainer(): boolean {
      return true;
    }

    public abstract acceptsChildType(type: ComponentTypes): boolean;

    public addChild(child: Component, after: JQuery): void {
      this.children.add(child);
      child.element.insertAfter(after);
      let targ: DropTarget = new DropTarget(this);
      targ.element.insertAfter(child.element);
    }

    public highlightForDropType(type: ComponentTypes): void {
      if (this.acceptsChildType(type)) {
        this.containerElement.children(".drop-target").css("border", "1px solid #0a0");
      }
      
      collections.forEach<Component>(this.children, (comp: Component) => {
        if (ContainerComponent.isContainer(comp)) {
          comp.highlightForDropType(type);
          return true;
        }
      });
    }

    public clearHighlight(): void {
      this.containerElement.children(".drop-target").css("border", "");
      
      collections.forEach<Component>(this.children, (comp: Component) => {
        if (ContainerComponent.isContainer(comp)) {
          comp.clearHighlight();
          return true;
        }
      });
    }

    public static isContainer(copm: Component): comp is ContainerComponent {
      return comp.getType() == ComponentTypes.PARALLAX || 
        comp.getType() == ComponentTypes.GRID || 
        comp.getType() == ComponentTypes.ROW || 
        comp.getType() == ComponentTypes.COL;
    }
  }
  
  class DropTarget {
    private cont: ContainerComponent;

    public element: JQuery;
    
    constructor(cont: ContainerComponent) {
      this.cont = cont;
      this.element = $("<div></div>");
      this.element.addClass("drop-target");
      
      this.element.on("click", (e: Event) => {
        let edit: Editor = Editor.instance;
        
        if (edit.isDragging && this.cont.acceptsChildType(edit.draggingComponent.getType())) {
          edit.endDrag();
          this.cont.addChild(edit.draggingComponent, this.element);
        }
      });
    }
  }

  class ParallaxComponent extends ContainerComponent {
    
    private imageElement: JQuery;
    
    constructor() {
      super();
      this.element = $("<div></div>");
      this.element.addClass("parallax-container");
      
      let parallax: JQuery = $("<div></div>");
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
    
    public getType(): ComponentTypes {
      return ComponentTypes.PARALLAX;
    }

    public acceptsChildType(type: ComponentTypes): boolean {
      return type == ComponentTypes.ROW;
    }

    public static isParallax(comp: Component): comp is ParallaxComponent {
      return comp.getType() == ComponentTypes.PARALLAX;
    }
  }
  
  class GridComponent extends ContainerComponent {
    constructor() {
      super();
      this.element = $("<div></div>");
      this.containerElement = this.element;
      
      this.element.addClass("container");
      
      this.containerInit();
    }
    
    public getType(): ComponentTypes {
      return ComponentTypes.GRID;
    }
    
    public acceptsChildType(type: ComponentTypes): boolean {
      return type == ComponentTypes.ROW;
    }
    
    public static isGrid(comp: Component): comp is GridComponent {
      return comp.getType() == ComponentTypes.GRID;
    }
  }
  
  class RowComponent extends ContainerComponent {
    constructor() {
      super();
      this.element = $("<div></div>");
      this.containerElement = this.element;
      
      this.element.addClass("row");
      
      this.containerInit();
    }
    
    public getType(): ComponentTypes {
      return ComponentTypes.ROW;
    }
    
    public acceptsChildType(type: ComponentTypes): boolean {
      return type == ComponentTypes.COL;
    }
    
    public static isRow(comp: Component): comp is RowComponent {
      return comp.getType() == ComponentTypes.ROW;
    }
  }
  
  class ColComponent extends ContainerComponent {
    constructor() {
      super();
      this.element = $("<div></div>");
      this.containerElement = this.element;
      
      this.element.addClass("col");
      this.element.addClass("l3");
      this.element.addClass("m4");
      this.element.addClass("s12");
      
      this.containerInit();
    }
    
    public getType(): ComponentTypes {
      return ComponentTypes.COL;
    }
    
    public acceptsChildType(type: ComponentTypes): boolean {
      return !(type == ComponentTypes.ROW ||
        type == ComponentTypes.COL ||
        type == ComponentTypes.PARALLAX);
    }
    
    public static isCol(comp: Component): comp is ColComponent {
      return comp.getType() == ComponentTypes.COL;
    }
  }
  
  class TableComponent extends ContainerComponent {
    
  }

  class Accordion extends Component {
    
    protected containerElement: JQuery;
    
    protected children: collections.List<AccordionElement>;
    
    constructor() {
      super();
      this.element = $("<ul></ul>");
      this.containerElement = this.element;
      this.children = new collections.List<AccordionElement>();
      
      this.element.addClass("collapsible");
      this.element.attr("data-collapsible", "accordion");
      
      this.containerInit();
    }

    public getType(): ComponentTypes {
      return ComponentTypes.ACCORDION;
    }

    public isAccordion(comp: Component): comp is AccordionComponent {
      return comp.getType() == ComponentTypes.ACCORDION;
    }
  }
  
  class AccordionElement {
    
  }
  
  export abstract class TextComponent extends Component {
    constructor() {
      super();
    }
    
    public static isTextComponent(comp: Component): comp is TextComponent {
      return comp.getType() == ComponentTypes.HEADER ||
        comp.getType() == ComponentTypes.PARAGRAPH ||
        comp.getType() == ComponentTypes.LIST;
    }
  }

  class HeaderComponent extends TextComponent {
    constructor() {
      super();
      this.element = $("<h2></h2>");
    }
  }
  
  $(document).ready(() => {
    Editor.instance = new Editor();
  });
}
