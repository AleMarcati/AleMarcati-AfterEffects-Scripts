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

var titleGroup = win.add("group", undefined, "");
var text = titleGroup.add("statictext", undefined, "AutoSlicer");
titleGroup.orientation = "row";

var buttonGroup = win.add("group", undefined, "");
buttonGroup.orientation = "row";
var button_Slice = buttonGroup.add("button", undefined, "Slice");

showWindow(win);

var proj = app.project;

button_Slice.onClick = function()
{

    var activeComp = proj.activeItem;
    var slicesFolder;

    if (!(activeComp instanceof CompItem)){
        alert ("No active composition. Select the composition that has the slice reference layers.");
        return;
    }

    for (i = 1; i <= proj.items.length; i++)
    {

        if(proj.items[i].name == "Slices")
        {
            slicesFolder = proj.items[i];
        }
    }
    
    if (slicesFolder == null)
    {
        slicesFolder = proj.items.addFolder("Slices");
    }

    for (i = 1; i <= activeComp.layers.length; i++)
    {

        var layer = activeComp.layers[i];
        

        if (layer instanceof AVLayer && layer.source.mainSource instanceof SolidSource)
        {

            var newSliceComp = proj.items.addComp(layer.name, layer.width, layer.height, 1, activeComp.duration, activeComp.frameRate);
            var workCompLayer = newSliceComp.layers.add(activeComp);
            workCompLayer.transform.position.setValue([workCompLayer.width/2 - layer.transform.position.value[0] + layer.width/2, workCompLayer.height/2 - layer.transform.position.value[1] + layer.height/2]);
            newSliceComp.parentFolder = slicesFolder;
        }   
    }




}