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
var text = group.add("statictext", undefined, "Keep moving.");

var group = win.add("group", undefined, "");
group.orientation = "row";

var positionSpeedGroup = win.add("group", undefined, "");
positionSpeedGroup.orientation = "row";
var text = positionSpeedGroup.add("statictext", undefined, "Position Speed:");
var movementSpeedText = positionSpeedGroup.add("edittext", undefined, "10");
movementSpeedText.characters = 6;

var positionDimensionsGroup = win.add("group", undefined, "");
positionDimensionsGroup.orientation = "row";
var xPosDimensionCheckbox = positionDimensionsGroup.add("checkbox", undefined, "X");
var yPosDimensionCheckbox = positionDimensionsGroup.add("checkbox", undefined, "Y");
var zPosDimensionCheckbox = positionDimensionsGroup.add("checkbox", undefined, "Z");



var rotationSpeedGroup = win.add("group", undefined, "");
rotationSpeedGroup.orientation = "row";
var text = rotationSpeedGroup.add("statictext", undefined, "Rotation Speed:");
var rotationSpeedText = rotationSpeedGroup.add("edittext", undefined, "5");
rotationSpeedText.characters = 6;

var rotationDimensionsGroup = win.add("group", undefined, "");
var rotationDimensionCheckbox = rotationDimensionsGroup.add("checkbox", undefined, "Rotation");


var scaleSpeedGroup = win.add("group", undefined, "");
scaleSpeedGroup.orientation = "row";
var text = scaleSpeedGroup.add("statictext", undefined, "Scale Speed:");
var scaleSpeedText = scaleSpeedGroup.add("edittext", undefined, "1");
scaleSpeedText.characters = 6;

var scaleDimensionsGroup = win.add("group", undefined, "");
scaleDimensionsGroup.orientation = "row";
var scaleDimensionCheckbox = scaleDimensionsGroup.add("checkbox", undefined, "Scale");

//set initial dimensions checkboxes values:
xPosDimensionCheckbox.value = true;
yPosDimensionCheckbox.value = false;
zPosDimensionCheckbox.value = false;
rotationDimensionCheckbox.value = false;
scaleDimensionCheckbox.value = false;

//Update slider position on text change:
movementSpeedText.onChanging = function(){

    var firstChar = this.text.slice(0,1);

    var textWithOnlyNumbers = this.text.replace(/[^\d]/g,'');

    if (firstChar == "-"){
        this.text = firstChar + textWithOnlyNumbers;
    } else {
        this.text = textWithOnlyNumbers;
    }
}

rotationSpeedText.onChanging = function(){

    var firstChar = this.text.slice(0,1);

    var textWithOnlyNumbers = this.text.replace(/[^\d]/g,'');

    if (firstChar == "-"){
        this.text = firstChar + textWithOnlyNumbers;
    } else {
        this.text = textWithOnlyNumbers;
    }
}

scaleSpeedText.onChanging = function(){

    var firstChar = this.text.slice(0,1);

    var textWithOnlyNumbers = this.text.replace(/[^\d]/g,'');

    if (firstChar == "-"){
        this.text = firstChar + textWithOnlyNumbers;
    } else {
        this.text = textWithOnlyNumbers;
    }
}


var group = win.add("group", undefined, "");
group.orientation = "row";
var button_Apply = group.add("button", undefined, "Apply");

showWindow(win);

button_Apply.onClick = function(){

    var activeItem = app.project.activeItem;

    if (!(activeItem instanceof CompItem)){
        alert ("No active composition.");
        return;
    }

    var myComp = app.project.activeItem;
    mySelectedLayers = myComp.selectedLayers;
    

    if (mySelectedLayers.length == 0) {
        alert ("Select at least one layer.");
        return;
    }

    var movementSpeedValue = parseInt(movementSpeedText.text);
    var rotationSpeedValue = parseInt(rotationSpeedText.text);
    var scaleSpeedValue = parseInt(scaleSpeedText.text);

    //create null controller
    var nullLayerController = myComp.layers.addNull(myComp.duration);
    var nullLayerControllerName;
    if (mySelectedLayers.length > 1)
    {
        nullLayerControllerName = "Multiple Layers Controller";
    } 
    else 
    {
        nullLayerControllerName = mySelectedLayers[0].name + " Controller";
    }
    nullLayerController.name = nullLayerControllerName;

    //add position speed slider
    if (xPosDimensionCheckbox.value || yPosDimensionCheckbox.value || zPosDimensionCheckbox.value) {
        var posSpeedSlider = nullLayerController.Effects.addProperty("ADBE Slider Control");
        posSpeedSlider.name = "Position Speed Control";
        var posSpeedSliderName = posSpeedSlider.name;
        posSpeedSlider.property("Slider").setValue([movementSpeedValue]);
    }


    //add rotation speed slider
    if (rotationDimensionCheckbox.value == true){
        var rotSpeedSlider = nullLayerController.Effects.addProperty("ADBE Slider Control");
        rotSpeedSlider.name = "Rotation Speed Control";
        var rotSpeedSliderName = rotSpeedSlider.name;
        rotSpeedSlider.property("Slider").setValue([rotationSpeedValue]);
    }

    //add scale speed slider
    if (scaleDimensionCheckbox.value == true){
        var scaleSpeedSlider = nullLayerController.Effects.addProperty("ADBE Slider Control");
        scaleSpeedSlider.name = "Scale Speed Control";
        var scaleSpeedSliderName = scaleSpeedSlider.name;
        scaleSpeedSlider.property("Slider").setValue([scaleSpeedValue]);
    }

    

    for (var i = 0; i < mySelectedLayers.length; i++) {
        var currentItem = mySelectedLayers[i];
        
        //Separate position dimensions
        if (currentItem.property("Position").dimensionsSeparated == false){
            currentItem.property("Position").dimensionsSeparated = true;
        }

        //get separated dimensions properties
        var propertyPosX = currentItem.property("Position").getSeparationFollower(0);
        var propertyPosY = currentItem.property("Position").getSeparationFollower(1);
        var propertyPosZ = currentItem.property("Position").getSeparationFollower(2);


        var myPositionExpression = 'myTime = time - inPoint;\nspd = thisComp.layer("' + nullLayerController.name + '").effect("' + posSpeedSliderName + '")("Slider");\nvalue + (spd * myTime);';
        var myRotationExpression = 'myTime = time - inPoint;\nspd = thisComp.layer("' + nullLayerController.name + '").effect("' + rotSpeedSliderName + '")("Slider");\nvalue + (spd * myTime);';
        var myScaleExpression = 'myTime = time - inPoint;\nspd = thisComp.layer("' + nullLayerController.name + '").effect("' + scaleSpeedSliderName + '")("Slider");\nx = value[0] + (spd * myTime);\ny = value[1] + (spd * myTime);\n[x,y];';

        //add expressions to properties if their respective checkboxes are checked
        if (xPosDimensionCheckbox.value == true){
            propertyPosX.expression = myPositionExpression;
        }

        if (yPosDimensionCheckbox.value == true){
            propertyPosY.expression = myPositionExpression;
        }

        if (zPosDimensionCheckbox.value == true){

            if (currentItem.threeDLayer == false){
                alert('Layer #' + currentItem.index + ' - "' + currentItem.name +  '" is not 3D, converting it to 3D.')
                currentItem.threeDLayer = true;
            }
            propertyPosZ.expression = myPositionExpression;
        }

        if (rotationDimensionCheckbox.value == true){
            currentItem.property("Z Rotation").expression = myRotationExpression;
        }

        if (scaleDimensionCheckbox.value == true){
            currentItem.property("scale").expression = myScaleExpression;
        }
          

    }
   
}