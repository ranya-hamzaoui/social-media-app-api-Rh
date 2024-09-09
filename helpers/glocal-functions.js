
var ResponseRender = function (status,message="", data={}){
    return {
        statut:status,message,data
    }
}
function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}
module.exports ={
  ResponseRender,
  paginate
}