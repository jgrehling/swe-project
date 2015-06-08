var defaultColour;
var counter;
var counter_s;
var timeout;
var fieldsVisited;
// cumulated area lengths (x+y)
var area_lenght;
var current_iteration;
var paused;
var savedVarsOnPause;
var field_history;

function initialize() {

	// initialize global vars
	defaultColour = 0;
	counter = 1;
	fieldsVisited = [];
	// cumulated area lengths (x+y)
	area_lenght = 0;
	current_iteration = 1;
	paused = 0;
	savedVarsOnPause = [];

	// set user settings to variables
	timeout = $('#timeout').val();
	counter_s = $('#iterations').val();
	
	// initialize area
	var area = [];
	area[0] = [];
	area[1] = [];
	area[2] = [];
	area[0][0] = getColor();
	area[0][1] = getColor();
	area[1][0] = getColor();
	area[1][1] = getColor();
	area[0][2] = getColor();
	area[1][2] = getColor();
	area[1][1] = getColor();
	area[2][0] = getColor();
	area[2][1] = getColor();
	area[2][2] = getColor();

	// can be between 0 and 3 (0 equals north, 1 equals east, 2 equals south, 3 equals west)
	var orientation = $('#orientation').val();
	// initial position
	var position = [1,1];
	
	// trigger iterations
	nextStep(area, position, orientation);
}

/**
 * Returns a white, black or random color, depending on user configuration
 */
function getColor() {
	switch($('input[name=defaultcolour]:checked').val()) {
			case 'black':
				return 1;
				break;
			case 'white':
				return 0;
				break;
			case 'random':
				if(Math.random()<.5) {
					return 1;
				}else{	
					return 0;
				}
				break;
	}
}


/**
 * Function changes orientation variable
 *
 * @params rotateLeft - true for a left rotation, false for a right rotation
 * @returns orientation
 */
function changeOrientation(rotateLeft, orientation) {
	if(rotateLeft) {
		orientation --;
		// to keep orientation in boundaries of 0-3
		if(orientation < 0) {
			orientation = 3;
		}
	} else {
		orientation++;
		// to keep orientation in boundaries of 0-3
		if(orientation > 3) {
			orientation = 0;
		}
		
	}
	
	return orientation;
}

/**
 * Inverts the field colour in the area array at the given position coordinates.
 *
 * @params area current area
 * @params position current position
 * @returns area array
 */
 function invertColour(area, position) {
	if(area[position[0]][position[1]] == 0) {
		area[position[0]][position[1]] = 1;
	} else {
		area[position[0]][position[1]] = 0;
	}
	
	return area;
 }
 
 /**
  * Function changes the current robot position towards the orientation
  *
  * @params position current position
  * @params orientation current orientation
  * @returns position new position
  */
 function moveFocus(position, orientation) {

	switch(orientation) {
		case 0:
			position[1] = parseInt(position[1]) + 1;
			break;
		case 1:
			position[0] = parseInt(position[0]) + 1;
			break;
		case 2:
			position[1] = parseInt(position[1]) - 1;
			break;
		case 3:
			position[0] = parseInt(position[0]) - 1;
			break;
	}
	
	return position;
 }
 
 /**
  * Function ensures, that the array gets expanded, when position moves towards the edges
  * So we add array rows/cols where needed and correct the relative position if needed
  *
  * @params area current area
  * @params position current position
  * @returns array[area, position]
  */
 function centerFocusInArea(area, position) {
	// we have to add a vertical line at the right of the field
	if(area[position[0]+1] == undefined) {
	
		area[position[0]+1] = [];
		
		var length = area[position[0]].length;
		for (var i = 0; i < length; i++) {
			area[position[0]+1][i] = getColor();
		}
		
	// we have to add a horizontal line at the top of the field
	} else if(area[position[0]][position[1]+1] == undefined) {
				
		$(area).each(function() {
			this[position[1]+1] = getColor();
		});
	
	// we have to add a vertical line at the left side of the field
	} else if(position[0]-1 < 0) {
		var tempArray = [];
		var length = area[position[0]].length;
		
		for (var i = 0; i < length; i++) {
			tempArray[i] = getColor();
		}
		area.unshift(tempArray);
		position[0]++;
		
	// we have to add a horizontal line at the bottom of the field
	} else if(position[1]-1 < 0) { 
		
		$(area).each(function() {
			this.unshift(getColor());
		});
		position[1] ++;
	} 
	
	return [area, position];
 }
 
 /**
  * Function adds class to orientation arrow, to let the arrow show the current position
  *
  * @params orientation current orientation
  */
 function setOrientationArrow(orientation) {
    var arrowfield = $("#arrowfield");
	switch(orientation) {
		case 0:
			arrowfield.removeClass().addClass("orientation-top");
			break;
		case 1:
            arrowfield.removeClass().addClass("orientation-right");
			break;
		case 2:
            arrowfield.removeClass().addClass("orientation-bottom");
			break;
		case 3:
            arrowfield.removeClass().addClass("orientation-left");
			break;
	}
 }
 
 /**
  * Function draws the current array.
  * The table gets only redrawn, if a line/row was added.
  * Otherwise we simply change the classes that show the current array.
  * 
  * @position area current area
  * @position position current position
  * @position orientation current orientation
  */
 function drawArray(area, position, orientation) {
	var content = "<table>";
	var xLength = area.length;
	var yLength = area[0].length;
	
	// if the array has exceeded its borders
	if((parseInt(xLength) + parseInt(yLength)) > area_lenght) {
			
		for(var i=yLength-1; i >= 0; i--) {
			content += "<tr>";
			
			for(var j=0; j < xLength; j++) {
				content += "<td id='" + j + "_" + i + "'></td>";
			}
			
			content += "</tr>";
		}
			
		content += "</table>";

		$('#arrayDrawn').html(content);
		area_lenght = parseInt(xLength) + parseInt(yLength);
	}
	
	$(area).each(function(xIndex) {
	
		$(this).each(function(yIndex) {

            var field = $("#" + xIndex + "_"+ yIndex);
			field.removeClass();
			
			if(this == 0) {
                field.addClass("white").html();
			} else {
                field.addClass("black").html();
			}
			
		});
	
	});
	// remove old current position marker
	$('#arrayDrawn td.currentPosition').removeClass('currentPosition');
	$("#" + position[0] + "_" + position[1]).removeClass().addClass('currentPosition');

	$('#currentIteration').html(current_iteration);
	
	setOrientationArrow(orientation);	
 }

 /**
  * Function resumes/pauses the current execution
  */
function pause() {
	if(paused == 1) {
        setPause(0);
		nextStep(savedVarsOnPause[0], savedVarsOnPause[1], savedVarsOnPause[2]);
	} else {
        setPause(1);
    }
}


/**
 * Sets pause and the pause button the given value
 * @param val
 */
function setPause(val){
    if(val == 1) {
        paused = 1;
        $('#btn-pause').html('<i class="mdi-av-play-arrow left"></i>Fortsetzen');
    }
    if (val ==0) {
        paused = 0;
        $('#btn-pause').html('<i class="mdi-av-pause left"></i>Pausieren');
    }
}
/**
 * Function triggers initialisation - but makes previously sure that no execution is still running
 */
function start() {
    setPause(0);
	paused = 1;
    $('#btn-pause').removeClass('disabled');
    $('#infos').removeClass('hide');
	setTimeout(function(){ initialize() }, parseInt(timeout) + 100);
}

 
/**
 * Main Function that handles the single steps.
 * Re-Calls itself as long as the execution was not paused or the iteration-limit is reached.
 * 
 * @params area current area
 * @params position current position
 * @params orientation current orientation
 */
function nextStep(area, position, orientation) {

	drawArray(area, position, orientation);
    saveArray(area);
	
	// field is black
	if(area[position[0]][position[1]] == 1) {
		// rotate 90 degree to the left
		orientation = changeOrientation(true, orientation);
	// field is white
	}else{
		// rotate 90 degree to the right
		orientation = changeOrientation(false, orientation);
	}

	// invert colour of the currently focused field
	area = invertColour(area, position);
	position = moveFocus(position, orientation);
	var temp = centerFocusInArea(area, position);
	area = temp[0];
	position = temp[1];
	
	current_iteration ++;
	// check if program is paused
	if(paused == 0) {
		// check if counter is exceeded
		if(counter < counter_s) {
			counter ++;
			// Re-Call function after given timeout
			setTimeout(function() { nextStep(area, position, orientation) }, timeout );
		}
	
	// save current values
	} else {
		savedVarsOnPause[0] = area;
		savedVarsOnPause[1] = position;
		savedVarsOnPause[2] = orientation;
	}
}

function saveArea(area){


}
