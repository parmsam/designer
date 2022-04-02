var selected_component = "header";
const UPDATEABLE_ELEMENT = [
  "dropdown", "input", "output", "button", "radio", "checkbox"
];

$(document).ready(function() {
  $(".component_settings").on("change", updateDesignerElement);
  updateDesignerElement(true);

  $(".component_settings[data-component= '" + selected_component + "']").css("display", "unset");

  $("#settings-component .dropdown-item").on("click", (el) => {
    selected_component = $(el.target).data("shinyelement");
    $(".component_settings").css("display", "");
    $(".component_settings[data-component= '" + selected_component + "']").css("display", "unset");
    updateDesignerElement(true);
  });
});

updateDesignerElement = function(update_sortable = false) {
  $(".component-container").html(null);
  var component = selected_component;
  var component_html = designerElements[component]();
  var container = document.getElementById("sidebar-container");
  $(".component-container").html(component_html);

  if (component === "dropdown") {
    $(".component-container").find("select").selectize({
      labelField: "label",
      valueField: "value",
      searchField: ["label"],
      placeholder: "select input"
    });
  }

  if (update_sortable) {
    Sortable.create(container, {
      group: {
        name: "shared",
        pull: "clone",
        put: false
      },
      onClone: function(evt) {
        var component = selected_component;
        var sortable_settings = designerSortableSettings[component];
        if (sortable_settings) {
          Sortable.create(evt.item, sortable_settings);
        }
      },
      onEnd: function(evt) {
        var component = selected_component;
        if (UPDATEABLE_ELEMENT.includes(component)) {
          updateDesignerElement();
        }
      }
    });
  }
};

createRandomID = function(prefix) {
  return prefix + "_" + Math.random().toString(36).substr(2, 10);
};

validateCssUnit = function(x, fallback) {
  const regex = /^(auto|inherit|fit-content|calc\(.*\)|((\.\d+)|(\d+(\.\d+)?))(%|in|cm|mm|ch|em|ex|rem|pt|pc|px|vh|vw|vmin|vmax))$/;
  if (regex.test(x)) {
    return x;
  } else {
    return fallback;
  }
};

createListItem = function(x) {
    var el = document.createElement("li");
    $(el).html(x);
    $(el).attr("data-shinyfunction", "tags$li");
    return el;
};

createCheckbox = function(x, id = "", type = "checkbox", inline = false) {
  var el = document.createElement("label");
  $(el).addClass(inline ? type + "-inline" : type);

  var el_input = document.createElement("input");
  $(el_input).attr("type", type);
  $(el_input).attr("name", id);
  $(el_input).attr("value", x);

  var el_label = document.createElement("span");
  $(el_label).html(x);

  $(el).html(el_input);
  $(el).append(el_label);

  return el;
};

const designerElements = {
  header: function() {
    var el = document.createElement($("#sidebar-header-tag").val());
    $(el).addClass("designer-element");
    $(el).attr("data-shinyfunction", $("#sidebar-header-tag").val());
    $(el).html($("#sidebar-header-value").val());
    return el;
  },

  row: function() {
    var el = document.createElement("div");
    $(el).addClass("designer-element row");
    $(el).attr("data-shinyfunction", "fluidRow");
    return el;
  },

  column: function() {
    var el = document.createElement("div");
    $(el).addClass("designer-element col-sm");

    var width = $("#sidebar-column-width").val();
    $(el).addClass("col-sm-" + width);

    var offset = $("#sidebar-column-offset").val();
    if (offset > 0) {
      $(el).addClass("offset-md-" + offset + " col-sm-offset-" + offset);
    }

    if (offset > 0) {
      $(el).attr("data-shinyattributes", "width = " + width + ", offset = " + offset);
    } else {
      $(el).attr("data-shinyattributes", "width = " + width);
    }

    $(el).attr("data-shinyfunction", "column");
    return el;
  },

  text: function() {
    var type = $("#sidebar-text-type").val();
    var el = document.createElement(type);
    $(el).addClass("designer-element");

    if (type === "p") {
      $(el).html($("#sidebar-text-contents").val());
    } else {
      var list_items = $("#sidebar-text-contents").val().split("\n");
      $(el).html(list_items.map(createListItem));
    }

    $(el).attr("data-shinyfunction", "tags$" + type);
    return el;
  },

  input_panel: function() {
    var el = document.createElement("div");
    $(el).addClass("designer-element shiny-input-panel shiny-flow-layout");
    $(el).attr("data-shinyfunction", "inputPanel");
    return el;
  },

  input: function() {
    var el = document.createElement("div");
    var type = $("#sidebar-input-type").val();
    $(el).attr("data-shinyfunction", type + "Input");
    $(el).addClass("designer-element form-group shiny-input-container");


    var label = $("#sidebar-input-label").val();
    var id = $("#sidebar-input-id").val();
    if (id === "") {
      id = createRandomID("input");
    }

    var input_value = "";
    if (type === "numeric") {
      input_value = ", value = 1";
    }

    var width_str;
    var width = validateCssUnit($("#sidebar-input-width").val(), "");
    if (width === "") {
      width_str = "";
    } else {
      $(el).css("width", width);
      width_str = `, width = "${width}"`;
    }

    $(el).attr("data-shinyattributes", `inputId = "${id}", label = "${label}"${input_value}${width_str}`);

    var el_label = document.createElement("label");
    $(el_label).addClass("control-label");
    $(el_label).html(label);

    var child_input_tag = "input";
    if (type === "textArea") {
      child_input_tag = "textarea";
    }
    var el_input = document.createElement(child_input_tag);
    $(el_input).addClass("form-control");
    if (type !== "textArea") {
      var input_types = {numeric: "Numeric", text: "Text", password: "Password"};
      $(el_input).attr("type", input_types[type] + " Input");
    }
    $(el_input).attr("placeholder", type);

    $(el).html(el_label);
    $(el).append(el_input);
    return el;
  },

  dropdown: function() {
    var el = document.createElement("div");
    $(el).attr("data-shinyfunction", "selectInput");
    $(el).addClass("designer-element form-group shiny-input-container");


    var label = $("#sidebar-dropdown-label").val();
    var id = $("#sidebar-dropdown-id").val();
    if (id === "") {
      id = createRandomID("dropdown");
    }

    var width_str;
    var width = validateCssUnit($("#sidebar-dropdown-width").val(), "");
    if (width === "") {
      width_str = "";
    } else {
      $(el).css("width", width);
      width_str = `, width = "${width}"`;
    }

    $(el).attr("data-shinyattributes", `inputId = "${id}", label = "${label}", choices = "..."${width_str}`);

    var el_label = document.createElement("label");
    $(el_label).addClass("control-label");
    $(el_label).html(label);

    var el_dropdown = document.createElement("div");
    $(el_dropdown).html(document.createElement("select"));

    $(el).html(el_label);
    $(el).append(el_dropdown);
    return el;
  },

  checkbox: function() {
    var el = document.createElement("div");
    $(el).attr("data-shinyfunction", "checkboxInput");
    $(el).addClass("designer-element form-group shiny-input-container");

    var label = $("#sidebar-checkbox-label").val();
    var id = $("#sidebar-checkbox-id").val();
    if (id === "") {
      id = createRandomID("checkbox");
    }
    var attributes_str = `inputId = "${id}", label = "${label}"`;

    var width = validateCssUnit($("#sidebar-checkbox-width").val(), "");
    if (width !== "") {
      $(el).css("width", width);
      attributes_str = `${attributes_str}, width = "${width}"`;
    }

    var el_label = document.createElement("span");
    $(el_label).html(label);

    var el_input = document.createElement("input");
    $(el_input).attr("id", id);
    $(el_input).attr("type", "checkbox");

    var checked = document.getElementById("sidebar-checkbox-checked").checked;
    if (checked) {
      $(el_input).attr("checked", "checked");
      attributes_str = `${attributes_str}, value = TRUE`;
    }

    var el_checkbox = document.createElement("div");
    var el_check_label = document.createElement("label");

    $(el_check_label).html(el_input);
    $(el_check_label).append(el_label);
    $(el_checkbox).html(el_check_label);

    $(el).attr("data-shinyattributes", attributes_str);
    $(el).html(el_checkbox);
    return el;
  },

  radio: function() {
    var el = document.createElement("div");
    $(el).addClass("designer-element form-group shiny-input-container");

    var label = $("#sidebar-radio-label").val();
    var id = $("#sidebar-radio-id").val();
    var type = $('#sidebar-radio-type input:checked').val();
    var choice_str = $('#sidebar-radio-choices').val().replaceAll("\n", '", "');
    var inline = document.getElementById("sidebar-radio-inline").checked;
    if (id === "") {
      id = createRandomID(type + "group");
    }

    $(el).addClass("shiny-input-" + type + "group");
    $(el).attr(
      "data-shinyfunction",
      type === "radio" ? "radioButtons" : "checkboxGroupInput"
    );
    $(el).attr("role", "group");
    $(el).attr("aria-labelledby", id + "-label");

    var attributes_str = `inputId = "${id}", label = "${label}", choices = c("${choice_str}")`;

    if (inline) {
      $(el).addClass("shiny-input-container-inline");
      attributes_str = `${attributes_str}, inline = TRUE`;
    }

    var width = validateCssUnit($("#sidebar-radio-width").val(), "");
    if (width !== "") {
      $(el).css("width", width);
      attributes_str = `${attributes_str}, width = "${width}"`;
    }

    var el_label = document.createElement("label");
    $(el_label).html(label);
    $(el_label).attr("id", id + "-label");
    $(el_label).attr("for", id);
    $(el_label).addClass("control-label");

    var el_input = document.createElement("div");
    $(el_input).addClass("shiny-options-group");

    var choices = $("#sidebar-radio-choices").val().split("\n");
    $(el_input).html(choices.map(function(choice) {
      return createCheckbox(
        choice,
        id = id,
        type = type,
        inline = inline
      );
    }));

    $(el).attr("data-shinyattributes", attributes_str);
    $(el).html(el_label);
    $(el).append(el_input);
    return el;
  },

  button: function() {
    var el = document.createElement("button");
    $(el).attr("data-shinyfunction", "actionButton");
    $(el).addClass("designer-element btn btn-default");

    var label = $("#sidebar-button-label").val();
    var button_class = $("#sidebar-button-class").val();
    var id = $("#sidebar-button-id").val();
    if (id === "") {
      id = createRandomID("button");
    }

    var width_str = "";
    var width = validateCssUnit($("#sidebar-button-width").val(), "");
    if (width !== "") {
      width_str = `, width = "${width}"`;
      $(el).css("width", width);
    }

    if (button_class === "default") {
      $(el).attr("data-shinyattributes", `inputId = "${id}"${width_str}`);
    } else {
      $(el).attr("data-shinyattributes", `inputId = "${id}"${width_str}, class = "btn-${button_class}"`);
      $(el).addClass("btn-" + button_class);
    }

    $(el).html(label);
    return el;
  },

  output: function() {
    var el;
    var inline_text = "";
    var type = $("#sidebar-output-type").val();
    var type2 = switch(type) {
      case "table": {"datatable"; break;}
      case "verbatimText": {"text"; break;}
      default: {type; break}
    };
    var inline = document.getElementById("sidebar-output-inline").checked;
    var contents = outputContents[type]();

    if (type === "verbatimText") {
      el = document.createElement("pre");
    } else if (inline) {
      el = document.createElement("span");
      inline_text = ", inline = TRUE";
    } else {
      el = document.createElement("div");
    }

    var id = $("#sidebar-output-id").val();
    if (id === "") {
      id = createRandomID(type);
    }

    var height_str = "";
    var width_str = "";
    if (["plot", "image"].includes(type)) {

      var width = validateCssUnit($("#sidebar-output-width").val(), "100%");
      var height = validateCssUnit($("#sidebar-output-height").val(), "400px");
      if (width !== "100%") {
        width_str = `, width = "${width}"`;
      }
      if (height !== "400px") {
        height_str = `, height = "${height}"`;
      }

      $(el).css("width", width);
      $(el).css("height", height);

    } else if (["text", "verbatimText"].includes(type)) {
      contents = contents + $("#sidebar-output-contents").val();
    }

    $(el).attr("data-shinyfunction", type + "Output");
    $(el).attr("data-shinyattributes", `outputId = "${id}"${inline_text}${height_str}${width_str}`);
    $(el).addClass(`designer-element output-element ${type}-output-element shiny-${type2}-output`);
    $(el).html(contents);
    return el;
  }
};

const outputContents = {
  text: function() {
    return "Text Output: ";
  },
  verbatimText: function() {
    return "Verbatim Text Output: ";
  },
  plot: function() {
    var el = document.createElement("img");
    $(el).attr("src", "images/plot.png");
    $(el).attr("alt", "Placeholder for a plot output");
    $(el).attr("title", "Example Plot");
    return el;
  },
  table: function() {
    return "Example Table Output";
  },
  image: function() {
    var el = document.createElement("img");
    $(el).attr("src", "images/image.png");
    $(el).attr("alt", "Placeholder for an image output");
    $(el).attr("title", "Example Image");
    return el;
  },
  html: function() {
    return "Placeholder for HTML Output";
  }
};

const designerSortableSettings = {
  row: {
    group: {
      name: "shared",
      put: function (to, from, clone) {
        return clone.classList.contains("col-sm");
      }
    }
  },
  column: {
    group: {
      name: "shared",
      put: function (to, from, clone) {
        return !clone.classList.contains("col-sm");
      }
    }
  },
  input_panel: {
    group: {
      name: "shared",
      put: function (to, from, clone) {
        return clone.classList.contains("form-group") || clone.classList.contains("btn");
      }
    }
  }
};
