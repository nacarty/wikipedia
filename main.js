var globalContinu = 0;
var globalStr = '';
var globalFetches = 0;
var globalObjArr = [];
var globalDatasetNum = 0;  //no data as yet
var globalLang = 'en';
var globalTranslation = 'Search Wikipedia';
 var str;
 var theUrl;
 var strField;
 
 
 function KeyPress(event)
{
    var x = event.which || event.keyCode;  //cross-browser. Some browsers do not recognize event.keyCode 
    if   (x === 13)    //That means the enter key was pressed-->
        getData(0);
}
            
function getLanguage(v)
  {                                   
      var List = $('option[value ='+ v+']');

     globalTranslation = List[0].lang;
     globalLang = List[0].value;
     
     $('[name = "searchStr"]').attr('placeholder', globalTranslation);
     $('#randomLink').attr("href", "https://"+globalLang+".wikipedia.org/wiki/Special:Random");
     $('#randomLink').html(globalTranslation);
     
  }
 
function loadLanguages(langChoice)
{
    var op;
    var dArr =[];
    var selected = '';
    
    $.getJSON('all_268_languages.json', function(data){
                        op = $('#languageOptions');
                        
                        data.langlinks.forEach(function(cur, i, arr){
                            if (cur.lang === langChoice.trim())
                                selected = 'selected';
                            else 
                                selected = '';
  
                           op.append('<option lang =  "'+ cur.wikipedia+'"    value = "'+ cur.lang+'"   '+selected+ '> '+cur.lang.toUpperCase()+'    -    '+cur.autonym.toLocaleUpperCase()+'    -    '+cur.langname+'  </option>') ;                            
                      
                        });                      
    });   
}
 
function bubbleSort(Arr)
{
    var temp;
    var limit = Arr.length - 1;
    var count;
    
    for ( var i =0 ; i < limit;  i++)
    {
        count = limit - i;
        
        for (var j = 0; j < count; j++)
        if  ((Arr[j].title > Arr[j+1].title))  
        {
            temp = Arr[j];
            Arr[j] = Arr[j+1];
           Arr[j+1] = temp;
        }
    }    
    return Arr;
}
 
function displayData(dArr){
   var str = ' ';  
   
   var dataSection = $("#data").empty();
   //dataSection.empty();
   
   dArr.forEach( function(cur, i, dArr){
     
      str =   '<div  class = "info"><h2>'+cur.title+'</h2><h4>'+cur.extract+'</h4>'+
                  '<h6 class = "urls"><a href="'+cur.fullurl+'"  target = "_blank" >View file on Wikipedia</a></h6><h6 class = "urls"><a href="'+cur.editurl+'" target = "_blank">Edit file on Wikipedia</a></h6>'+
                  '<h6 id = "time" class = "urls"> Size: '+(cur.length/1000).toFixed(2)+' KB</h6></div>';
      
       dataSection.append(str);
       
   });   
   
   $(".buttonDiv").css("display", "inherit");

} 
 
function manipulateData(d)
{
    var myObj =d.query.pages;
    var keyArr = [];
    var objArr =[];  
     
    if (d.continue === undefined)
        globalContinu = -1; //no extra data exists to retrieve
    else 
    {
        globalContinu = d.continue.gsroffset;
    }
    
    for ( var Key in myObj)   // or keyArr = Object.keys(myObj); that is, find the keys of the object and place them in an array
        keyArr.push(Key);    //push all the keys of the objects in myObj into an array
    
    keyArr.forEach(  function(cur, i){
        objArr.push(myObj[cur]);
     });
     
     var sortedArr =   bubbleSort(objArr);
     
     globalObjArr = globalObjArr.concat(sortedArr);    
    
    $(".status").empty().append("There are "+globalObjArr.length+" records in memory");   // for testing purposes to see if length of globalObjArr[] is increasing
    
    displayData( sortedArr );                                                   
}


function getData(choice){      //i = 0, 1 or -1  for new search, right search and left search respectively 
 
 
     if (choice === 0)
    {
        globalLang = $('#languageOptions').val().trim();                  
        globalDatasetNum = 1;  //dataset requested
        globalFetches = 0;
        globalContinu = 0;
        globalObjArr = [];
        theUrl = '';
        str  = '';
        
         strField =  $("[name='searchStr']");
         str = strField.val().trim();
         strField.val('');
         
         $(".buttonDiv").css("display", "none");
         $("#data").empty();
    }
    else
    {
         globalDatasetNum += choice;
         
         if (globalDatasetNum > (globalFetches + 1))
             globalDatasetNum = globalFetches +1;
         else if  (globalDatasetNum < 1)
             globalDatasetNum = 1;
         else
             globalDatasetNum += 0;  //else no change
     }
     
   //HAVING SETUP THE GLOBAL VARIABLES, DETERMINE THE NEXT COURSE OF ACTION//  
    
     if (  (globalDatasetNum > globalFetches) && (globalContinu !== -1))
     {                
      
       theUrl = 'https://'+globalLang+'.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrlimit=10'+
                        '&prop=info|extracts&inprop=url&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=' + str+'&gsroffset='+globalContinu;
         
            if (  (str.length > 0) && (str !== '!!Entry Cannot Be BLANK!!') )
              {
                  strField.val('Wait until data is received....');
            //for the following to work, format MUST be set to json in the url string above AND the dataType MUST be set to jsonp in the ajax object below.    
             $.ajax({dataType:'jsonp', 
                            url: theUrl,
                            success: function(data, textStatus, jqXHR){
                                    globalFetches += 1;
                                    strField.val('');
                                     manipulateData(data);
                                 },
                             error: function(jqXHR, errorType, exceptionObj){
                                    strField.val('Internet error code: '+errorType);
                                 }    
                            });  
                 
               }//if
               
               else
                   strField.val('!!Entry Cannot Be BLANK!!');  //do nothing
       
   } //if
   
   else  if ( ( globalDatasetNum <= globalFetches )&&( globalDatasetNum > 0 ) )
   {
      var lowerBound = (globalDatasetNum - 1) * 10; 
      var upperBound = (globalDatasetNum  * 10);
      
      displayData(  globalObjArr.slice(lowerBound, upperBound)  ); //global
   }
   
   else //if globalContinu = -1
   {
       $(".status").empty().append("No more information on Wikipedia!");
       setTimeout( function(){
                                                         $(".status").empty().append("There are "+globalObjArr.length+" records in memory");
                                                    }
                                ,3000);
       
   }
   
}
 