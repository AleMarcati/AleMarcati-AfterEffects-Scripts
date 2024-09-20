function createDockableUI(thisObj) {
    var dialog =
        thisObj instanceof Panel
            ? thisObj
            : new Window("window", undefined, undefined, { resizeable: true });
    dialog.onResizing = dialog.onResize = function() {
        this.layout.resize();
    };
    return dialog;
}

function showWindow(myWindow) {
    if (myWindow instanceof Window) {
        myWindow.center();
        myWindow.show();
    }
    if (myWindow instanceof Panel) {
        myWindow.layout.layout(true);
        myWindow.layout.resize();
    }
}


var win = createDockableUI(this);
win.orientation = "column";

var group = win.add("group", undefined, "");
var text = group.add("statictext", undefined, "Rename project items.");

var group = win.add("group", undefined, "");
group.orientation = "row";

var text = group.add("statictext", undefined, "Text to replace:");
var textToBeReplaced = group.add("EditText", undefined, "");
textToBeReplaced.characters = 12;

var group = win.add("group", undefined, "");
group.orientation = "row";

var text = group.add("statictext", undefined, "Replace with:");
var textToReplaceWith= group.add("EditText", undefined, "");
textToReplaceWith.characters = 12;

var group = win.add("group", undefined, "");
group.orientation = "row";
var button_Rename = group.add("button", undefined, "Rename");



var mySelectedItems = [];

showWindow(win);

button_Rename.onClick = function() {
   mySelectedItems = app.project.selection;


    if (mySelectedItems.length == 0) {
        alert ("Select at least one project item.");
    } else {

        for (var i = 0; i < mySelectedItems.length; i++) {
            var currentItem = mySelectedItems[i];

            var oldName = currentItem.name;
            var newName = oldName.replace(textToBeReplaced.text, textToReplaceWith.text);

            currentItem.name = newName;

            app.project.autoFixExpressions(oldName, newName);

        }
   
    }    
       
}


