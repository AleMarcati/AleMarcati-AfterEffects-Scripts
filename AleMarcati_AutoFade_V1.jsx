/*
SCRIPT: Auto Fade In-Out
Created by AleMarcati Scripts
DESCRIPTION: Creates a UI to set a fade duration and applies an expression to
             the opacity parameter of all selected layers. The expression
             automatically fades the layer in at its inPoint and out at its outPoint.
*/

(function autoFadeInOut(thisObj) {

    // --- Configuration & UI Setup ---

    var SCRIPT_NAME = "Auto Fade In-Out";
    var SIGNATURE = "AleMarcati Scripts";

    // Function to build the script UI panel
    function buildUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", SCRIPT_NAME, undefined, { resizeable: true });
        myPanel.orientation = "column";

        // Group for the input field
        var inputGroup = myPanel.add("group");
        inputGroup.orientation = "row";
        inputGroup.alignChildren = "center";
        inputGroup.add("statictext", undefined, "Fade Duration (sec):");

        // Input field for the fade duration, default to 0.5 seconds
        var fadeDurationEdit = inputGroup.add("edittext", [0, 0, 50, 20], "0.5");
        fadeDurationEdit.active = true; // Focus on the input field

        // Apply button
        var applyButton = myPanel.add("button", undefined, "Apply Expression");
        applyButton.onClick = function () {
            // Pass the text value to the application function
            applyExpression(fadeDurationEdit.text);
        };

        // Signature
        var sigText = myPanel.add("statictext", undefined, "Created by " + SIGNATURE);
        sigText.justify = "center";

        // Display the panel
        if (myPanel instanceof Window) {
            myPanel.center();
            myPanel.show();
        } else {
            myPanel.layout.layout(true);
        }
    }


    // --- Expression Definition ---

    // The expression will be a JavaScript function that uses the linear() method.
    // It will calculate two values: one for the fade in and one for the fade out,
    // and take the minimum of the two.
    function getOpacityExpression(fadeDur) {

        var expression = [
            "// Created by " + SIGNATURE,
            "// Opacity auto-fade expression with a fade duration of " + fadeDur + " seconds.",
            "",
            "var fadeDuration = " + fadeDur + ";",
            "var originalOpacity = value;",
            "",
            "// Calculates fade in (0 to 100) from inPoint to inPoint + fadeDuration",
            "var fadeIn = linear(time, inPoint, inPoint + fadeDuration, 0, originalOpacity);",
            "",
            "// Calculates fade out (100 to 0) from outPoint - fadeDuration to outPoint",
            "var fadeOut = linear(time, outPoint - fadeDuration, outPoint, originalOpacity, 0);",
            "",
            "// Opacity is the minimum of the two values. This ensures:",
            "// 1. Before In: 0 (fadeIn is 0)",
            "// 2. During Hold: originalOpacity (both are originalOpacity)",
            "// 3. After Out: 0 (fadeOut is 0)",
            "Math.min(fadeIn, fadeOut);"
        ].join("\n");

        return expression;
    }

    // --- Core Logic ---

    // Function to apply the expression to selected layers
    function applyExpression(fadeDurationText) {

        var comp = app.project.activeItem;

        // Check for active composition
        if (!(comp instanceof CompItem)) {
            alert("Please open a composition and make it active in the timeline panel.", SCRIPT_NAME);
            return;
        }

        // Validate input
        var fadeDur = parseFloat(fadeDurationText);
        if (isNaN(fadeDur) || fadeDur <= 0) {
            alert("Please enter a valid fade duration greater than 0.", SCRIPT_NAME);
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select one or more layers in the timeline.", SCRIPT_NAME);
            return;
        }

        // Get the final expression string with the user-defined duration
        var finalExpression = getOpacityExpression(fadeDur);
        var appliedCount = 0;

        // Begin undo group for safety and convenience
        app.beginUndoGroup(SCRIPT_NAME + " Apply Expression");

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            try {
                // Ensure the property exists (e.g., skips lights, cameras, etc.)
                var opacityProp = layer.property("Opacity");
                if (opacityProp) {
                    opacityProp.expression = finalExpression;
                    appliedCount++;
                }
            } catch (e) {
                // Ignore errors for layers without an Opacity property
                // $.writeln("Could not apply expression to layer: " + layer.name);
            }
        }

        app.endUndoGroup();

        if (appliedCount <= 0) {
            alert("No expression was applied. Check that you have selected standard layers (excluding cameras/lights).", SCRIPT_NAME);
        }
    }

    // --- Run the Script ---
    buildUI(thisObj);

})(this);