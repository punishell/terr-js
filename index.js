import { LCDClient, MsgSend, MnemonicKey, MsgStoreCode, MsgInstantiateContract, MsgExecuteContract } from '@terra-money/terra.js';
import { readFileSync } from 'fs';

// create a key out of a mnemonic
const mk = new MnemonicKey({
  mnemonic:
    'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
});

// connect to bombay testnet
// const terra = new LCDClient({
//   URL: 'https://bombay-lcd.terra.dev',
//   chainID: 'bombay-12',
// });

// To use LocalTerra
const terra = new LCDClient({
  URL: 'http://localhost:1317',
  chainID: 'localterra'
});

// a wallet can be created out of any key
// wallets abstract transaction building
const wallet = terra.wallet(mk);


//Upload a Contract:
const factory_wasm = await readFileSync('/home/ziion/my-first-contract/artifacts/my_first_contract.wasm', 'base64');
const upload_Msg = new MsgStoreCode('terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v', factory_wasm)
const upload_result = await wallet.createAndSignTx({
    msgs: [upload_Msg],
  })
  .then(tx => terra.tx.broadcast(tx))
  .then(result => {
    return(`${result.logs[0].eventsByType.store_code.code_id[0]}`);
  });



// Instnatiate Contract:
  const init_Msg = new MsgInstantiateContract('terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v', undefined, upload_result,{count: 100},undefined,'counter')
  const my_contract_addr = await wallet.createAndSignTx({
    msgs: [init_Msg],
  })
  .then(tx => terra.tx.broadcast(tx))
  .then(result => {
    const attributes = result.logs[0].events[0].attributes
    let str = JSON.stringify(attributes[0].value)
    str = str.slice(0, -1);
    str = str.substring(1);
    return str
   //return attributes[attributes.length - 1].value 
  });

console.log('Address of my first contract: ' + my_contract_addr);

//Execute First Msg:
const execute_msg = new MsgExecuteContract("terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v",my_contract_addr,{increment:{}},);
const execute_result = await wallet.createAndSignTx({
    msgs: [execute_msg],
  })
  .then(tx => terra.tx.broadcast(tx))
  .then(result => {
    const attributes = result
    return JSON.stringify(attributes)
  });

  console.log('Result of msg Execution: ' + execute_result );
  
