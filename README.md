# CCIP Compatible Token

IF you are familiar with blockchain technology you already know that it is not possible to have connections between blockchains directly. But in some cases we need to transfer especially our assets for various reasons. Such as your assets are on Ethereum, but since it is quite expensive to transfer assets on Ethereum you may want to have a bridge between Ethereum and say Polygon network so that you can transfer your assets in a cheaper manner. But this is not a straigntforward thing to do. Fortunately Chainlink's Cross-Chain Interoperability Protocol exists and we can use it to bridge our assets between multiple blockchains.

For this first we need a token contract that is compatible for this purpose. Let's see what we need. First of all to transfer assets from one blockchain to another we need to burn that asset in one blockchain and mint in another one (We chosen burn-mint->burn-mint strategy). Then we need to restrict the mint function only to those that are authorised. Let's now recap it:

1. Add `burn()` function
2. Add `mint()` function
3. Add authorisation, in our case `admin{}` modifier

# Deploying Metafluence CCIP

To deploy Metafluence CCIP compatible upgrade (with features above added) we need to follow the steps below.

1. Firstly we need to install dependencies

```shell
npm install
```

2. Then we need to compile contracts

```shell
npx hardhat compile
```

3. Finally we can deploy contracts to your desired blockchain by following command

- Binance Smart Chain

```sehll
npx hardhat run --network bsc scripts/metafluenceCCIP.deploy.js
```

or

```shell
npm run dp-bsc
```

- BNB testnet

```shell
npx hardhat run --network tbsc scripts/metafluenceCCIP.deploy.js
```

or

```shell
npm run dp-test
```

- Hardhat local

```shell
npx hardhat run scripts/metafluenceCCIP.deploy.js
```

# Deploy Preipheral Metafluence

Peripheral Metafluence Token does not mint tokens when deployed.

To deploy and also verify on block explorer you need to run below commands for each blockchain network

```shell
# BNB Smart Chain
npm run pr-pol
# Ethereum
npm run pr-eth
# Polygon
npm run pr-bsc
```
