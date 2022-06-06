import { Component } from "./Component";

export class Tab extends Component{
    _item = 1;
    name = "Tab";

    constructor() {
        super();

        $('#component_settings').css("display", "none");
        $('#tab_settings').css("display", "");
    };

    updateComponent() {

    };

    getPageType() {
        return $('#settings-page_type input:radio:checked').val();
    };

    addPage() {
        const page_type = this.getPageType();

        const tab_name = $("#sidebar-tab_name").val();
        if (this.checkDuplicateNames(tab_name, page_type)) {
            return;
        }

        let tab_value = $("#sidebar-tab_value").val();
        if (tab_value === "") {
          tab_value = this.createID("tab");
        }
        if (this.checkDuplicateIDs(tab_value, page_type)) {
            return;
        }

        $("#sidebar-tab_alert div").alert("close");

        if (page_type === "dashboardPage") {
            this.addMenuItem(tab_name, tab_value);
        } else {
            this.addTab(tab_name, tab_value);
        }
    };

    addTab(tab_name, tab_value) {
        const nav_panel = $("ul.navbar-nav");
        const nav_id = nav_panel.data("tabsetid");

        const tab_panel = $(".tab-content");
        const active_class = tab_panel.html() === "" ? "active" : "";
        
        nav_panel.append(`
            <li class="${active_class}">
                <a href="#tab-${nav_id}-${this._item}" data-toggle="tab"
                   data-bs-toggle="tab" data-value="${tab_value}" data-name="${tab_name}">${tab_name}</a>
            </li>
        `);

        tab_panel.append(`
            <div class="tab-pane ${active_class}" data-value="${tab_value}" id="tab-${nav_id}-${this._item}"
                 data-shinyfunction="tabPanel" data-shinyattributes="title = &quot;${tab_name}&quot;, value = &quot;${tab_value}&quot;"></div>
        `);

        this.enableSortablePage(`tab-${nav_id}-${this._item}`);
        this._item = this._item + 1;
    };

    addMenuItem(tab_name, tab_value) {
        const tab_panel = $("section.content .tab-content");
        const active_class = tab_panel.html() === "" ? "active" : "";
        
        $(".sidebarMenuSelectedTabItem").before(`
            <li class="nav-item" data-shinyfunction="bs4Dash::menuItem"
                data-shinyattributes="text = &quot;${tab_name}&quot;, tabName = &quot;${tab_value}&quot;">
                <a class="nav-link ${active_class}" id="tab-${tab_value}" href="#"
                   data-toggle="tab" data-target="#shiny-tab-${tab_value}"
                   data-value="${tab_value}" data-name="${tab_name}">
                    <p>${tab_name}</p>
                </a>
            </li>
        `);

        if (!$(".sidebarMenuSelectedTabItem").attr("data-value")) {
            $(".sidebarMenuSelectedTabItem").attr("data-value", tab_value);
        }

        tab_panel.append(`
            <div role="tabpanel" data-value="${tab_value}" id="shiny-tab-${tab_value}"
                 class="tab-pane container-fluid ${active_class}"
                    data-shinyfunction="bs4Dash::tabItem" data-shinyattributes="tabName = &quot;${tab_value}&quot;"></div>
        `);

        this.enableSortablePage(`shiny-tab-${tab_value}`);
    };

    enableSortablePage (id) {
        Sortable.create(document.getElementById(id), {
            group: {
                name: "shared",
                put: function (_to, _from, clone) {
                    return !clone.classList.contains("col-sm");
                }
            }
        });
    };  

    checkDuplicateNames(tab_name, page_type) {
        if ($(this.getNameIdentifier(tab_name, page_type)).length > 0) {
            $("#sidebar-tab_alert").html(`
                <div class="alert alert-danger" role="alert">
                    ${tab_name} is the name of an existing menu item. Please choose a unique name
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `);
            return true;
        } else {
            return false;
        }
    };

    getNameIdentifier(tab_name, page_type) {
        if (page_type === "dashboardPage") {
            return `ul.sidebar-menu a[data-name='${tab_name}']`;
        } else {
            return `ul.navbar-nav a[data-name='${tab_name}']`;
        }
    };

    checkDuplicateIDs(tab_name, page_type) {
        if ($(this.getValueIdentifier(tab_name, page_type)).length > 0) {
            $("#sidebar-tab_alert").html(`
                <div class="alert alert-danger" role="alert">
                    ${tab_value} is the ID of an existing menu item. Please choose a unique ID
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `);
            return true;
        } else {
            return false;
        }
    };

    getValueIdentifier(tab_value, page_type) {
        if (page_type === "dashboardPage") {
            return `ul.sidebar-menu a[data-value='${tab_value}']`;
        } else {
            return `ul.navbar-nav a[data-value='${tab_value}']`;
        }
    };

    deletePage() {
        const page_type = this.getPageType();
        const tab_name = $("#sidebar-tab_name").val();

        if (!this.checkExistingNames(tab_name, page_type)) {
            return true;
        }

        $("#sidebar-tab_alert div").alert("close");

        if (page_type === "dashboardPage") {
            this.deleteMenuItem(tab_name);
        } else {
            this.deleteTab(tab_name);
        }
    };

    deleteTab(tab_name) {
        const tab_value = $(`ul.nav a[data-name='${tab_name}']`).data("value");
        $(delete_tab[0].parentElement).remove();
        $(`.tab-content .tab-pane[data-value='${tab_value}']`).remove();
    };

    deleteMenuItem(tab_name) {
        const tab_value = $(`ul.nav a[data-name='${tab_name}']`).data("value");
        $(`#tab-${tab_value}`).parent().remove();
        $(`#shiny-tab-${tab_value}`).remove();
    };    
    
    checkExistingNames(tab_name, page_type) {
        if ($(this.getNameIdentifier(tab_name, page_type)).length > 0) {
            return true;
        } else {
            $("#sidebar-tab_alert").html(`
                <div class="alert alert-danger" role="alert">
                    Unable to find a tab with the name "${tab_name}"
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `);            
            return false;
        }
    };
}
