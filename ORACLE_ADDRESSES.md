# Oracle Addresses - Monad Mainnet

Complete list of oracle contract addresses and feed IDs used in the Oracle Dashboard.

## Network Information

| Property | Value |
|----------|-------|
| Network | Monad Mainnet |
| Chain ID | `10143` |
| RPC URL | `https://rpc.monad.xyz` |

## BTC/USD Oracles

| Oracle | Label | Type | Address / ID |
|--------|-------|------|--------------|
| Chainlink | `CHAINLINK_BTC_USD` | Contract | `0xc1d4C3331635184fA4C3c22fb92211B2Ac9E0546` |
| Pyth | `PYTH_CONTRACT` | Contract | `0x2880aB155794e7179c9eE2e38200202908C17B43` |
| Pyth | `PYTH_BTC_USD_FEED_ID` | Feed ID | `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |
| Chronicle | `CHRONICLE_BTC_USD` | Contract | `0xECd09Ce60c069384D6B91656A841097F1181A59e` |
| eOracle | `EORACLE_BTC_USD` | Contract | `0xEB0CDef56e02A334B7eaB620560aDa727bB994f6` |
| Orocle | `OROCLE_CONTRACT` | Contract | `0x78291455bf33aA5437f9D69Ff63E0B1C09833429` |
| Orocle | `OROCLE_BTC_IDENTIFIER` | Identifier | `0x4254430000000000000000000000000000000000` ("BTC" as bytes20) |
| RedStone | `REDSTONE_BTC_USD` | Contract | `0xED2B1ca5D7E246f615c2291De309643D41FeC97e` |
| Stork | `STORK_CONTRACT` | Contract | `0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62` |
| Stork | `STORK_BTC_USD_ID` | Feed ID | `0x7404e3d104ea7841c3d9e6fd20adfe99b4ad586bc08d8f3bd3afef894cf184de` |
| Supra | `SUPRA_CONTRACT` | Contract | `0x58e158c74DF7Ad6396C0dcbadc4878faC9e93d57` |
| Supra | `SUPRA_BTC_USD_PAIR_ID` | Pair ID | `18` |

## MON/USD Oracles

| Oracle | Label | Type | Address / ID |
|--------|-------|------|--------------|
| Chainlink | `CHAINLINK_MON_USD` | Contract | `0xBcD78f76005B7515837af6b50c7C52BCf73822fb` |
| Pyth | `PYTH_MON_USD_FEED_ID` | Feed ID | `0x31491744e2dbf6df7fcf4ac0820d18a609b49076d45066d3568424e62f686cd1` |
| Chronicle | `CHRONICLE_MON_USD` | Contract | `0x936a444C983347FFBfe3F26D1497CAbfA2BfE271` |
| Orocle | `OROCLE_MON_IDENTIFIER` | Identifier | `0x4D4F4E0000000000000000000000000000000000` ("MON" as bytes20) |
| RedStone | `REDSTONE_MON_USD` | Contract | `0x1C9582E87eD6E99bc23EC0e6Eb52eE9d7C0D6bcd` |
| Stork | `STORK_MON_USD_ID` | Feed ID | `0xa4f6b07ae0c89e3f3cc03c1badcc3e9adffdf7206bafcd56d142979800887385` |
| Supra | `SUPRA_MON_USDT_PAIR_ID` | Pair ID | `569` |

## Notes

- **Pyth** uses a single contract with different feed IDs per asset
- **Orocle** uses a single contract with bytes20 identifiers (asset ticker encoded)
- **Stork** uses a single contract with bytes32 feed IDs
- **Supra** uses pair IDs (integers) to identify price feeds
