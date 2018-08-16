const hexToAscii = (hexStr) => {
  if (hexStr.slice(0, 2) === '0x') {
    hexStr = hexStr.slice(2)
  }
  var hex = hexStr.toString()
  var str = ''
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
  }
  return str
}

module.exports = hexToAscii
