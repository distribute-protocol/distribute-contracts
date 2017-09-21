exports.getProjectAddress = function(receiptFromMakeProject){
    tmp = receiptFromMakeProject.logs[0].args.project
    // console.log(tmp)
    return tmp
}
