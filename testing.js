let totalCapitalTokenSupply = 0
let totalFreeCapitalTokenSupply = 0
let weiBal = 0
let baseCost = 100000000000000

function currentPrice () {
  return weiBal / totalCapitalTokenSupply
}

function percent (num, denom, prec) {
  let _num = num * 10 ** (prec + 1)
  let _quo = ((_num / denom) + 5) / 10
  console.log('numerator', _num, 'denom', denom, 'quotient', _quo)
  return _quo
}
function mint (_tokens, amount) {
  let weiAmount = amount * 10 ** 18
  let targetPrice
  let newSupply = totalCapitalTokenSupply + _tokens
  let cp = currentPrice()
  if (totalCapitalTokenSupply === 0 || cp === 0) {
    targetPrice = baseCost
  } else {
    targetPrice = (cp * 1000 + cp * percent(_tokens, newSupply, 3)) / 1000
  }
  let ethRequired = targetPrice * newSupply - weiBal
  console.log('ethRequired', ethRequired)
  if (weiAmount >= ethRequired) {
    totalCapitalTokenSupply += _tokens
    totalFreeCapitalTokenSupply += _tokens
    weiBal += ethRequired
    let fundsLeft = weiAmount - ethRequired
    if (fundsLeft > 0) {
      console.log('funds left', fundsLeft)
    }
  } else {
    console.log('not enough eth')
  }
}
