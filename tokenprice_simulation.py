#Jessica Marshall
#Distribute simulation

#import packages
import numpy as np

#initial values/global variables
constant = 1
pool_ETH = 0
token_supply = 0
worker_id = 0
tokenholder_id = 0
project_id = 0
    #hard code project array for simulation
    #first dim are projects, second dim are token holders, third dim are workers
projects = np.array((100, 100, 100))


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

        global tokenholder_id
        self.tokenholderid = tokenholder_id     #to keep track of token holders
        tokenholder_id += 1
        #print('initialized TokenHolder', self.tokenholderid)

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

    def createProject(self, _cost, _id):
        Project(_cost, _id)
        #add task functionality here!

    #def stakeProject(self, num_tokens, _projectid):
        #lock up tokens in array

    #def validateProject():

    #def voteProject():

class Worker:

    def __init__(self):
        self.worktokens = 1     #each worker is initialized with one token

        global worker_id
        self.workerid = worker_id
        worker_id += 1
        print('initialized worker', self.workerid)

    #def stakeProject():

    #def pickTask();

    #def voteProject():


class Project:

        def __init__(self, _cost):         #_id should be the name of the project
            self.project_cost = _cost
            self.project_state = 'proposed'

            global project_id
            self.projectid = project_id
            project_id += 1
            print('initialized project', self.projectid)

            #proposed, open, active, completed, [incomplete], validated/[failed]
            if (burnPrice() == 0):
                self.project_tokens = None
            else:
                self.project_tokens = (_cost / burnPrice())    #at initialization, number of tokens needed
            print('project', self.projectid, 'initialized')
            print('total project cost: ', self.project_cost, 'ETH')
            print('tokens required at initialization: ', self.project_tokens, '\n')

        def changeState(self):
            state = ['proposed', 'active', 'open', 'complete', 'validated']
            if self.project_state in state:
                print('old state of', self.projectid, 'is', self.project_state)
                index = state.index( self.project_state)
                self.project_state = state[index + 1]
                print('new state of', self.projectid, 'is', self.project_state)
            else:
                print('state not in state list');

            #incomplete & failed states to be done separately

        #def refundProposer():

def main():
    Jessica = TokenHolder()
    Ashoka = TokenHolder()
    Project1 = Project(1)
    Project1.changeState()
    #create an array of token holders
    #have a few of them createProjects

if __name__ == "__main__":
    main()
