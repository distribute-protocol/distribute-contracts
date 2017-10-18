#Jessica Marshall
#Distribute
#plotting curation market price curve

import numpy as np
import matplotlib.pyplot as plt

#REMEMBER THAT 1 ETHER IS 1E18 WEI

baseCost = 1e15
q = 618046
totalSupply = 100

def weiToETH(wei):
    ETH = wei/(1e18)
    return ETH

def weiToDollar(wei):
    ETH = weiToETH(wei)
    dollar = ETH*300
    return dollar

def fracExp(k, q, n, p):
    #via: http://ethereum.stackexchange.com/questions/10425/is-there-any-efficient-way-to-compute-the-exponentiation-of-a-fraction-and-an-in/10432#10432
    #Computes `k * (1+1/q) ^ N`, with precision `p`. The higher
    #the precision, the higher the gas cost. It should be
    #something around the log of `n`. When `p == n`, the
    #precision is absolute (sans possible integer overflows).
    #Much smaller values are sufficient to get a great approximation.
    s = 0
    N = 1
    B = 1
    for i in range(0, p):
        s += k * N / B / (q**i)
        N = N * (n - 1)
        B = B * (i + 1)
    #print(s)
    return s

def updateMintingPrice(_supply):
    costperToken = baseCost + fracExp(baseCost, q, _supply, 2) + baseCost*_supply/1000
    costInDollars = weiToDollar(costperToken)
    print(_supply, '     $', costInDollars)
    return costInDollars

def plotCurve():
    x = np.linspace(0, totalSupply, totalSupply + 1)
    y = np.zeros(totalSupply + 1)
    for i in range(0, totalSupply + 1):
        y[i] = updateMintingPrice(i)
    
    fig1 = plt.figure()
    ax1 = fig1.add_subplot(111)
    ax1.set_xlabel('token supply')
    ax1.set_ylabel('minting price (wei)')
    ax1.set_title('Minting Tokens', fontweight='bold')
    ax1.plot(x, y)
    
def main():
    plotCurve()
  
if __name__== "__main__":
    main()