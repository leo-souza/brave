exports.uuid = function(){
  var text = "";
  var possible = "ABCDEFGHJIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#";

  for( var i=0; i < 12; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
