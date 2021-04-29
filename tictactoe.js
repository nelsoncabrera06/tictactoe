var userteam = "x";
var board = '---------';
var status;
var gameurl;


function posttoserver(datos){	// Start a new game
	let xhr = new XMLHttpRequest();     // Creating a XHR object 
	let url = "api/v1/games"; 

	xhr.open("POST", url, true);        // open a connection 
	xhr.setRequestHeader("Content-Type", "application/json");   
	
	xhr.onreadystatechange = function () {  // Create a state change callback 
		if (xhr.readyState === 4 && xhr.status === 200) { 

			// Print received data from server 
			console.log('Received from server');
            console.log(this.responseText);

        }else if (xhr.readyState === 4 && xhr.status === 201) { 
			// Print received data from server 
			console.log('Received from server');
            console.log(this.responseText);
            gameurl = JSON.parse(this.responseText).location;
            console.log('gameurl: ' + gameurl);
            gettoserver(gameurl);

		}  
        
	}; 

	// Converting JSON data to string 
	var data = JSON.stringify(datos); 

	// Sending data with the request 
	xhr.send(data); 
	console.log('data sent');
	console.log(data);
}


function getserver(){ // Get all games
	
	let xhr = new XMLHttpRequest(); // Creating a XHR object 
	let url = "api/v1/games"; 

	xhr.open("GET", url, true);    // open a connection 

	// Set the request header i.e. which type of content you are sending 
	xhr.setRequestHeader("Content-Type", "application/json"); 

	// Create a state change callback 
	xhr.onreadystatechange = function () { 
		if (xhr.readyState === 4 && xhr.status === 200) { 

			// Print received data from server 
			console.log('el server respondio');
            console.log(this.responseText);

		} 
	}; 

	// Sending the request 
    xhr.send();
	console.log('GET to ' + url);
}

function replaceAt (str, index, replacement) {

    const myarr = str.split('');
    myarr[index] = replacement;
    var x = myarr.toString();
    x = x.replace(/,/g,'');

    return x;
}

function show(box_element){ 
    var box;

    if(!status){
        alert("First choose a team and press start.");
    }else{
        
        if( status == 'DRAW' || status == 'X_WON' || status == 'O_WON' ){
            alert("Plase reset the game");
        }else{
            box = box_element.id[4]; // example: box_0 --> 0 ; box_1 --> 1
            if(board[box]=='-'){
                box_element.innerHTML = userteam;
                board = replaceAt(board, box, userteam);
                //console.log('board: ' + board);
                if(gameurl){
                    puttoserver(gameurl);
                }else{
                    // computer must move
                    var data = {
                        board: board 
                    }
                    posttoserver(data);
                }
                elemt = document.getElementById('output').style.display = "none";
            }else{
                alert("Choose another box");
            }
        }

    }
}

function puttoserver(url){              // new move to game
	let xhr = new XMLHttpRequest();     // Creating a XHR object 

	xhr.open("PUT", url, true);        // open a connection 
	xhr.setRequestHeader("Content-Type", "application/json");   

	xhr.onreadystatechange = function () {  // Create a state change callback 
		if (xhr.readyState === 4 && xhr.status === 200) { 
			// Print received data from server 
			console.log('Received from server ');
            console.log(this.responseText);
            board = JSON.parse(this.responseText).board;
            status = JSON.parse(this.responseText).status;
            //console.log('board: ' + board);
            update_board(board, status);

		}  
        
	}; 
	
	var datos = {
        board: board
    }

    // Converting JSON data to string 
	var data = JSON.stringify(datos); 

	// Sending data with the request 
	xhr.send(data); 
	console.log('Data sent put method to '  + url);
	console.log(data);
}

function tocheck(radio_element){ 

    userteam = radio_element.value;
}


function start(){
    
    /*
        In my game 'x' moves first. I consider that 
        if the board comes empty ('---------') then 
        the user chose the team 'o' and if it comes 
        with some 'x' then he chose the team 'x' (example '--x------').
    */
    status = 'INITIATED';

    console.log("userteam: " +  userteam);
    console.log("status: " +  status);
    document.getElementById('team').style.display = "none";
    document.getElementById('reset').style.display = "inline-block";
    

    if( userteam == 'x' ){
        // it's your turn, moves x

        elemt = document.getElementById('output');
        elemt.style.color = "green";
        elemt.innerHTML = "It's your turn!";

    }else{
        // computer must move
        var data = {
            board: '---------' 
        }
        posttoserver(data);
    }
    
}

function gettoserver(url){              // the URL must be the specific game URL
	let xhr = new XMLHttpRequest();     // Creating a XHR object 

	xhr.open("GET", url, true);        // open a connection 
	xhr.setRequestHeader("Content-Type", "application/json");   // Set the request header i.e. which type of content you are sending 

	xhr.onreadystatechange = function () {  // Create a state change callback 
		if (xhr.readyState === 4 && xhr.status === 200) { 
			// Print received data from server 
			console.log('Received data from server'); 
            console.log(this.responseText);
            board = JSON.parse(this.responseText).board;
            status = JSON.parse(this.responseText).status;
            update_board(board, status);

		}  
        
	}; 

	// Sending the request 
	xhr.send(); 
	console.log('Get sent to ' + url);
}

function update_board(board, status){
    //update board
    var elemt = document.getElementById('output');

    var myarr = board.split('');

    for(i=0; i<myarr.length ;i++){
        if(myarr[i] != '-'){
            document.getElementById('box_' + i).innerHTML = myarr[i];
        }else{
            document.getElementById('box_' + i).innerHTML = '';
        }
    }

    switch (status) {
        case 'RUNNING':
            break;
        case 'DRAW':
            elemt.style.display = "inline-block";
            elemt.style.color = "black";
            elemt.innerHTML = "DRAW";
            break;
        case 'X_WON':
            elemt.style.display = "inline-block";
            elemt.style.color = "green";
            elemt.innerHTML = "X WON";
            break;
        case 'O_WON':
            elemt.style.display = "inline-block";
            elemt.style.color = "blue";
            elemt.innerHTML = "O WON";
            break;
        default:
            break;
    }

   
}

function Reset(){
    
    userteam = "x";
    board = '---------';
    
    document.getElementById('team').style.display = "inline-block";
    document.getElementById('reset').style.display = "none";
    document.getElementById('output').style.display = "none";

    for(i=0; i<board.length ;i++){
        document.getElementById('box_' + i).innerHTML = '';
    }
    status = 0;
    deletegame(gameurl);
    gameurl = '';
    status = '';

    document.getElementById('team_x').checked = true;
    document.getElementById('team_o').checked = false;
 
}


function deletegame(url){              
	let xhr = new XMLHttpRequest();     // Creating a XHR object 

	xhr.open("DELETE", url, true);        // open a connection 
	xhr.setRequestHeader("Content-Type", "application/json");   

	xhr.onreadystatechange = function () {  // Create a state change callback 
		if (xhr.readyState === 4 && xhr.status === 200) { 
            console.log('Game id '+ url +' successfully deleted');
		}  
	}; 

	// Sending the request 
	xhr.send(); 
    console.log('Deleting game ' + url);
    
}





function AnalyseResponse(text){
    alert('estoy dentro de AnalyseResponse');
    //if(text != 'ready'){
    if(text != 'Game successfully started'){
        console.log(typeof text);
        var array = JSON.parse("[" + text + "]");
        console.log( array);
        console.log(typeof array);
        
        /*
        console.log( array[0]);
        console.log( typeof array[0]);
        console.log( array[0][0]);*/

        //update board
        for(i=0; i<board.length ;i++){
            if(board[i] != array[0][i]){
                board[i] = array[0][i];
                document.getElementById('box_' + i).innerHTML = array[0][i];
            }
        }
    }else{
        console.log("userteam = " +  userteam);
        document.getElementById('team').style.display = "none";
        document.getElementById('reset').style.display = "inline-block";


        elemt = document.getElementById('output');

        if(userteam == "o"){
            elemt.style.color = "black";
            elemt.innerHTML = "Computer moves";
        }else{
            elemt.style.color = "green";
            elemt.innerHTML = "It's your turn!";
        }
    
        status = 1;
        
    }
    
}