
#initial values
constant = 1
pool_ETH = 0
token_supply = 0

#mintPrice returns the amount of ether 1 token can be minted for
def mintPrice():
    if (pool_ETH == 0):
        return constant
    else:
        temp = (pool_ETH / token_supply) + constant
        return temp

#burnPrice returns the amount of ether 1 token can be burned for
def burnPrice():
    if (pool_ETH == 0):
        return 0
    else:
        temp = pool_ETH / token_supply
        return temp

class TokenHolder:

    def __init__(self):
        self.tokens = 0
        self.investment = 0     #a negative investment is a profit

    #mintTokens allows a TokenHolder to mint tokens for themself
    def mintTokens(self, num_tokens):
        global pool_ETH
        global token_supply
        global constant

        price = 0
        for i in range(0, num_tokens):
            price = mintPrice()
            self.tokens = self.tokens + 1
            self.investment = self.investment + price
            pool_ETH = pool_ETH + price
            token_supply = token_supply + 1
            print('minted one token for', price, 'ETH')
            print('tokens: ', self.tokens)
            print('investment:', self.investment, 'ETH')
            print('mint price of next token:', price, '\n')

    #burnTokens allows a TokenHolder to burn tokens for themself
    def burnTokens(self, num_tokens):
        price = 0
        if(self.tokens < num_tokens):
            print("You don't have", num_tokens, 'tokens to burn!\n')
        else:
            print(self.tokens)
            print(num_tokens)
            print(token_supply)
            price = burnPrice()
            total_price = price * num_tokens
            self.tokens = self.tokens - num_tokens
            self.investment = self.investment - total_price
            print('tokens left after burn:', self.tokens)
            print('investment left after burn:', self.investment, 'ETH')
            print('burn return per token:', price, 'ETH')
            print('total burn return:', total_price, 'ETH\n')

class Project:

        def __init__(self, cost):
            self.project_cost = cost
            self.project_stage = 'proposed'
            if (burnPrice() == 0):
                self.project_tokens = None
            else:
                self.project_tokens = (cost / burnPrice())    #at initialization, number of tokens needed
            print('project initialized')
            print('total project cost: ', self.project_cost, 'ETH')
            print('tokens required at initialization: ', self.project_tokens, '\n')


#define instances of TokenHolder class
Jessica = TokenHolder()
Ashoka = TokenHolder()
node442 = Project(10)
#example class method calls
Jessica.mintTokens(1)
node443 = Project(10)
#Ashoka.mintTokens(5)
Jessica.burnTokens(11)
#Jessica.burnTokens(9)

#to do -> simulations of different use cases, plot profit, token value over time
