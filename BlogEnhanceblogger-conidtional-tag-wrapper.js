function wrap() {
   var selectedOption = document.getElementById("mySelect");
   var codeField = document.getElementById("codeField");
   var lineBreak = "\n";
   codeField.value = selectedOption.value + lineBreak + codeField.value + lineBreak + "</b:if>";
}

function htmlParser() {
   var re = /[<>"'&]/g
   for (i = 0; i < arguments.length; i++)
      arguments[i].value = arguments[i].value.replace(re, function(m) {
         return replacechar(m);
      })
   wrap();
}

function replacechar(match) {
   if (match == "<")
      return "&lt;"
   else if (match == ">")
      return "&gt;"
   else if (match == "\"")
      return "&quot;"
   else if (match == "'")
      return "&#039;"
   else if (match == "&")
      return "&amp;"
}

//Function for toggling in FAQ
(function() {
   $('dd').filter(':nth-child(n+4)').addClass('hide');

   $('dl').on('click', 'dt', function() {
      $(this).next().slideToggle(200);
   });
})();
