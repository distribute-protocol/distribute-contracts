# Distribute
[ ![Codeship Status for jessicagmarshall/Distribute](https://app.codeship.com/projects/bfec7110-964f-0135-8d76-6ed07d805e5a/status?branch=master)](https://app.codeship.com/projects/251547)

#### An experiment in using smart contract-enabled token economies to decentralize the governance, maintenance, and financial support of public utilities, communal infrastructure, and common pool resources.

The desired outcome of Distribute is a multifaceted incentive structure that makes sure that:

1. collective public infrastructure projects receive sufficient funding from capital holders;
2. governance of the public utility is totally transparent;
3. direct decision making power in the public utility is decoupled from financial investment;
4. the infrastructure itself is created, maintained, and operated by those who directly benefit from it;
5. multiple utilities may interlock in the future to create a synergistic system of many distributed utilities and communal infrastructure projects.

---

### Setup

Make sure to have [Truffle 4 beta](https://github.com/trufflesuite/truffle/releases) installed. Using other versions of truffle will result in solc errors.

If you already have Truffle 3 installed, uninstall it first:
`$ npm uninstall -g truffle`

Then install Truffle 4 beta:
`$ npm install -g truffle@beta`

If you haven't already, install [TestRPC](https://github.com/ethereumjs/testrpc):
`$ npm install -g ethereum-js testrpc`

### Run Tests

In its own window, start a TestRPC instance:
`$ testrpc`

In another window, deploy the contracts and run the tests:
`$ truffle test`
