//Create Database
var db = window.openDatabase("Database", "1.0", "PhoneGap Training", 200000);

function populateDB(tx) {
    		//tx.executeSql('DROP TABLE IF EXISTS DEMO');
    		tx.executeSql('CREATE TABLE IF NOT EXISTS NOTE (id INTEGER PRIMARY KEY AUTOINCREMENT, Titel TEXT NOT NULL,Value TEXT, date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP)');
		}
		function errorCB(err) {
   			console.log("Error processing SQL: " + err.code);
   			//$('#sql-result').html("<strong>Error processing SQL: " + err.code + "</strong>");
   			alert("Es ist ein Fehler aufgetreten: "+err.code);
		}
		function successCreateCB() {
   			console.log("Success creating Database 1.0");
   			//$('#sql-result').html("<strong>Success creating Database 1.0</strong>");
		}
		function createDB(){
    		db.transaction(populateDB, errorCB, successCreateCB);    
		}
//SQL Query TEST #######################################
        function querySuccess(tx, results) {
    		console.log("Rows Affected = " + results.rowAffected);
    		console.log("Num. Rows Returned = " + results.rows.length);
    		//$('#sql-result').html("<strong>Num. Rows Returned = " + results.rows.length + "</strong>" + 
    		//"<br>"+results.rows.item(0).id +
    		//"<br>"+results.rows.item(1).id );
		}
		function queryDB(tx) {
    		tx.executeSql('SELECT * FROM NOTE', [], querySuccess, errorCB);
		}
		function getSqlResultSet() {
    		db.transaction(queryDB, errorCB);    
		}
		
		//SQL Insert ##############################
		var titel = "";
		var value = "";
		function setInsert(note)
		{
			if(note.title == "")
				{
					titel = "[No Title]"
				}
			else {
				titel = note.title;
			}
			value = note.value;
			db.transaction(queryDBInsert, errorCB);
		}
		
		function queryDBInsert(tx)
		{
			tx.executeSql('insert into note(Titel,Value) values(?,?)',[titel,value],insertscucces,errorCB);
		}
		
		function insertscucces()
		{
			console.log("Insert Success");
			$.mobile.changePage("index.html",{reverse:true});
			updataDisplay();
		}
		
		//SQL GET Resultset #################################
		function updataDisplay()
		{
			db.transaction(queryDBselect, errorCB);
		}
		
		function queryDBselect(tx)
		{
			tx.executeSql('SELECT id,Titel,Value,date from NOTE order by date desc',[],insertDisplay, errorCB);
		}
		
		function insertDisplay(tx, results)
		{
			var s="";
			for(var i=0;i<results.rows.length; i++)
				{
					s += "<li><a href='edit.html?id="+results.rows.item(i).id+"'>" + results.rows.item(i).Titel +" "+results.rows.item(i).date+ "</a></li>";
				}
			console.log("ResultSet: "+s);
			$('#noteTitleList').html(s);
			$('#noteTitleList').listview("refresh");
			//document.getElementById("noteTitleList").innerHTML = s;
		}
		
		// SQL UPDATE ########################################
		var id =0;
		function editNote(note)
		{
			 titel = "";
			value = "";
			if(note.title == "")
			{
				titel = "[No Title]"
			}
			else {
				titel = note.title;
			}
			value = note.value;
			id= note.id;
			
			
			db.transaction(queryDBUpdate, errorCB);
		}
		
		function queryDBUpdate(tx)
		{
			//alert("id "+id.toString()+" titel "+titel.toString()+" value "+value.toString());
			tx.executeSql('UPDATE NOTE SET Titel=?, Value=? where id=?',[titel,value,id],successUpdate,errorCB);
		}
		
		function successUpdate()
		{
			console.log("succes Update ");
			$.mobile.changePage("index.html",{reverse:true});
			updataDisplay();
		}
		
		//Alles Loeschen ##########################################
		function allesloeschen()
		{
			var relVal = confirm("Wollen Sie wirklich alles Loeschen?");
			if( relVal == true)
			{
				deleteAll();
			} else {
				//abbrechen
				return;
			}
		}
		
		function deleteAll()
		{
			db.transaction(sqldrop, errorCB, successDropCB);
		}
		
		function sqldrop(tx)
		{
			tx.executeSql('DROP TABLE IF EXISTS NOTE');
		}
		
		function successDropCB()
		{
			console.log("Drop Database");
			createDB();
		}
		
		//init()################################
		function iniziallisiere()
		{
			//neue notiz
			$('#neueNotiz').live("submit",function(e) {
			var data = {title:$('#noteTitle').val(),
					value:$('#noteValue').val()
			};	
			setInsert(data);
			});
			
			//edit notiz
			$('#edit').live("pageshow", function() {
				var loc = window.location.hash;
				if(loc.indexOf("?") >=0) {
					var qs=loc.substr(loc.indexOf("?")+1,loc.length);
					var noteId = qs.split("=")[1];
					
					$('#editNotiz').attr("disabled","disabled");
					db.transaction(
							function(tx){
								tx.executeSql("SELECT id,Titel,Value from note where id=?",[noteId],function(tx,results){
									$('#noteId').val(results.rows.item(0).id);
									$('#noteTitle').val(results.rows.item(0).Titel);
									$('#noteValue').val(results.rows.item(0).Value);
									//$('#editNotiz').removeAttr("disabled");
								});
							},errorCB);
				} else {
					//$('#editNotiz').removeAttr("disabled");
				}
			});	
			
			$('#editNotiz').live("submit", function(e) {
				var data = { title:$('#noteTitle').val(),
						value:$('#noteValue').val(),
						id:$('#noteId').val()
				};
				editNote(data);
			});
		}
		