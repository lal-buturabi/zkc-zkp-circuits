import BN from "bn.js";
import path from "path";
import fs from "fs-extra";
import { CommandOp } from "delphinus-l2-client-helper/src/swap";
import { Field } from "delphinus-curves/src/field";


export interface CryptoUtil {
  derive_private_key: (seed: Uint8Array, suffix: Uint8Array) => Uint8Array;
  get_public_key: (privKey: Uint8Array) => Uint8Array;
  generate_ax_from_pub_key: (pubKey: Uint8Array) => Uint8Array;
  generate_ay_from_pub_key: (pubKey: Uint8Array) => Uint8Array;
  generate_rx_from_sign: (sign: Uint8Array) => Uint8Array;
  generate_ry_from_sign: (sign: Uint8Array) => Uint8Array;
  generate_s_from_sign: (sign: Uint8Array) => Uint8Array;
  sign: (msg: Uint8Array, publicKey: Uint8Array) => Uint8Array;
}

export class SignatureHelper {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  cryptoUtil: CryptoUtil;

  constructor(
    msg: string,
    derive_key: string,
    cryptoUtil: CryptoUtil
  ) {
    this.cryptoUtil = cryptoUtil;
    this.privateKey = this.cryptoUtil.derive_private_key(
      new TextEncoder().encode(msg),
      new TextEncoder().encode(derive_key)
    );
    this.publicKey = this.cryptoUtil.get_public_key(this.privateKey);
  }  

  getPubKey() {
    return this.publicKey;
  }

  getAX() {
    const ax = this.cryptoUtil.generate_ax_from_pub_key(
      this.publicKey
    );

    return ax;
  }

  getAY() {
    const ay = this.cryptoUtil.generate_ay_from_pub_key(
      this.publicKey
    );

    return ay;
  }

  getRX(sign: Uint8Array) {
    const rx = this.cryptoUtil.generate_rx_from_sign(
      sign
    );

    return rx;
  }

  getRY(sign: Uint8Array) {
    const ry = this.cryptoUtil.generate_ry_from_sign(
      sign
    );

    return ry;
  }

  getS(sign: Uint8Array) {
    const s = this.cryptoUtil.generate_s_from_sign(
      sign
    );

    return s;
  }

  getPrivKey() {
    return this.privateKey;
  }

  GetSignForAddPool(
    nonce: BN,
    tokenIndex0: BN,
    tokenIndex1: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = CommandOp.AddPool;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(tokenIndex0.toArray("be", 4), 9);
    buf.set(tokenIndex1.toArray("be", 4), 13);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForWithdraw(
    nonce: BN,
    accountIndex: BN,
    tokenIndex: BN,
    amount: BN,
    l1address: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = CommandOp.Withdraw;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(accountIndex.toArray("be", 4), 9);
    buf.set(tokenIndex.toArray("be", 4), 13);
    buf.set(amount.toArray("be", 32), 17);
    buf.set(l1address.toArray("be", 32), 49);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForSwap(
    nonce: BN,
    accountIndex: BN,
    poolIndex: BN,
    reverse: BN,
    amount: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = CommandOp.Swap;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(accountIndex.toArray("be", 4), 9);
    buf.set(poolIndex.toArray("be", 4), 13);
    buf.set(reverse.toArray("be", 32), 17);
    buf.set(amount.toArray("be", 32), 49);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForSupply(
    nonce: BN,
    accountIndex: BN,
    poolIndex: BN,
    amount0: BN,
    amount1: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = CommandOp.Supply;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(accountIndex.toArray("be", 4), 9);
    buf.set(poolIndex.toArray("be", 4), 13);
    buf.set(amount0.toArray("be", 32), 17);
    buf.set(amount1.toArray("be", 32), 49);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForRetrieve(
    nonce: BN,
    accountIndex: BN,
    poolIndex: BN,
    amount0: BN,
    amount1: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = CommandOp.Retrieve;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(accountIndex.toArray("be", 4), 9);
    buf.set(poolIndex.toArray("be", 4), 13);
    buf.set(amount0.toArray("be", 32), 17);
    buf.set(amount1.toArray("be", 32), 49);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForDeposit(
    nonce: BN,
    accountIndex: BN,
    tokenIndex: BN,
    amount: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = CommandOp.Deposit;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(accountIndex.toArray("be", 4), 9);
    buf.set(tokenIndex.toArray("be", 4), 13);
    buf.set(amount.toArray("be", 32), 17);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForDepositNFT(
    nonce: BN,
    owner: BN,
    nftIndex: BN,
    l1_tx_hash: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = 7;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(owner.toArray("be", 4), 9);
    buf.set(nftIndex.toArray("be", 4), 13);
    buf.set(l1_tx_hash.toArray("be", 32), 17);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForWithdrawNFT(
    nonce: BN,
    callerAccountIndex: BN,
    nftIndex: BN,
    l1account: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = 8;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(callerAccountIndex.toArray("be", 4), 9);
    buf.set(nftIndex.toArray("be", 4), 13);
    buf.set(l1account.toArray("be", 32), 17);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForTransferNFT(
    nonce: BN,
    callerAccountIndex: BN,
    nftIndex: BN,
    owner: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = 9;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(callerAccountIndex.toArray("be", 4), 9);
    buf.set(nftIndex.toArray("be", 4), 13);
    buf.set(owner.toArray("be", 32), 17);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForBidNFT(
    nonce: BN,
    callerAccountIndex: BN,
    nftIndex: BN,
    biddingAmount: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);
    buf.fill(0);
    buf[0] = 10;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(callerAccountIndex.toArray("be", 4), 9);
    buf.set(nftIndex.toArray("be", 4), 13);
    buf.set(biddingAmount.toArray("be", 32), 17);

    return this.DoSignFromBuf(filePath, buf);
  }

  GenerateSignForFinalizeNFT(
    nonce: BN,
    callerAccountIndex: BN,
    nftIndex: BN,
    filePath: string
  ) {
    const buf = new Uint8Array(81);

    buf.fill(0);
    buf[0] = 11;
    buf.set(nonce.toArray("be", 8), 1);
    buf.set(callerAccountIndex.toArray("be", 4), 9);
    buf.set(nftIndex.toArray("be", 4), 13);

    return this.DoSignFromBuf(filePath, buf);
  }

  DoSignFromBuf(filePath: string, buf: Uint8Array)
  {
    let palletRoot = path.join(__dirname, "..", "..", "..", "..", "..", "substrate-node", "pallets", "swap", "src", "unit_tests", "input");

    const sign = this.cryptoUtil.sign(buf, this.privateKey);
    let arr = new Array();
    let index;
    for(index in sign) {
      arr.push(sign[index]);
    }

    fs.writeJSONSync(path.join(palletRoot, filePath) + "_1.json", arr.slice(0, 32));
    fs.writeJSON(path.join(palletRoot, filePath) + "_2.json", arr.slice(32));

    const rx = this.getRX(sign);
    let rxBN = new BN(rx,10,"le");
    let rxField = new Field(rxBN);
    // console.log("rx: " + rx);
    // console.log("rxField: " + rxField.toString());
    const ry = this.getRY(sign);
    let ryBN = new BN(ry,10,"le");
    let ryField = new Field(ryBN);
    // console.log("ry: " + ry);
    // console.log("ryField: " + ryField.toString());
    const s = this.getS(sign);
    let sBN = new BN(s,10,"le");
    let sField = new Field(sBN);
    // console.log("s: " + s);
    // console.log("sField: " + sField.toString());

    return [rxField, ryField, sField];
  }

  GenerateAXAYFromPublicKey(pubKey: Uint8Array, filePath: string)
  {
    let palletRoot = path.join(__dirname, "..", "..", "..", "..", "..", "substrate-node", "pallets", "swap", "src", "unit_tests", "input");

    let arr = new Array();
    let index;
    for(index in this.publicKey) {
      arr.push(this.publicKey[index]);
    }

    fs.writeJSONSync(path.join(palletRoot, filePath) + ".json", arr);

    // console.log("public key: " + this.publicKey);
    const ax = this.getAX();
    let axBN = new BN(ax,10,"le");
    let axField = new Field(axBN);
    // console.log("ax: " + ax);
    // console.log("axField: " + axField.toString());
    const ay = this.getAY();
    let ayBN = new BN(ay,10,"le");
    let ayField = new Field(ayBN);
    // console.log("ay: " + ay);
    // console.log("ayField: " + ayField.toString());

    return [axField, ayField];
  }
}
