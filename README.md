# Distribute

#### An experiment in using smart contract-enabled token economies to decentralize the governance, maintenance, and financial support of public utilities, communal infrastructure, and common pool resources.

The desired outcome of Distribute is a multifaceted incentive structure that makes sure that:

1. collective public infrastructure projects receive sufficient funding from capital holders;
2. governance of the public utility is totally transparent;
3. direct decision making power in the public utility is decoupled from financial investment;
4. the infrastructure itself is created, maintained, and operated by those who directly benefit from it;
5. multiple utilities may interlock in the future to create a synergistic system of many distributed utilities and communal infrastructure projects.

---

### Setup

Make sure to have [Truffle v4.0.0](https://github.com/trufflesuite/truffle/releases/tag/v4.0.0) installed:

`$ npm install -g truffle`

Using other versions of truffle may result in solc warnings & errors.

### Run Tests

In a terminal window, run the following command:

`$ truffle develop`

In the resulting command line interface (which contains an integrated test blockchain, removing the need for a TestRPC instance for testing), run the following commands:

`truffle(develop)> compile`

`truffle(develop)> migrate`

`truffle(develop)> test`
