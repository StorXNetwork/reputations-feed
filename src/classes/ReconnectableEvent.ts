import { AbiItem } from 'xdc3-utils';
import Xdc3 from "xdc3"
import { Contract } from "xdc3-eth-contract"
import { WebsocketProvider } from 'xdc3-core';

export interface ConnectionObject {
  ws: string;
  abi: AbiItem[];
  address: string;
  fromBlock: number;
}

export class ReconnectableEvent {

  xdc3: Xdc3;
  contract: Contract;
  watcher: any;
  reconnInterval: any;
  connOpts: ConnectionObject;
  provider: WebsocketProvider;

  constructor(public event: string, public handler: Function, connOpts: ConnectionObject) {
    this.connOpts = connOpts
    this.provider = new Xdc3.providers.WebsocketProvider(connOpts.ws)
    this.xdc3 = new Xdc3(this.provider);
    this.contract = new this.xdc3.eth.Contract(connOpts.abi, connOpts.address)
    this.reconnect()
    this.reconn()
  }

  watch() {
    this.watcher = this.contract.events[this.event]({ fromBlock: this.connOpts.fromBlock }).on('data', this.handler)
  }

  reconn() {
    this.reconnInterval = setInterval(() => {
      this.xdc3.eth.net.isListening().then(x => {
        if (!x) this.reconnect()
      }).catch(() => {
        console.log("status", "error");
        this.reconnect()
      })
    }, 5000)
  }

  unsubscribe() {
    this.watcher.unsubscribe()
  }

  disconnect() {
    this.provider.disconnect(0, "test")
    console.log("disconnected");
  }

  reconnect() {
    this.provider = new Xdc3.providers.WebsocketProvider(this.connOpts.ws)
    this.xdc3 = new Xdc3(this.provider);
    this.contract = new this.xdc3.eth.Contract(this.connOpts.abi, this.connOpts.address)
    if (this.watcher) this.unsubscribe()
    this.watch()
  }
}

export class ReconnectableXdc3 {
  xdc3: Xdc3;
  reconnInterval: any;
  ws: string;
  provider: WebsocketProvider;

  constructor(ws: string) {
    this.ws = ws
    this.provider = new Xdc3.providers.WebsocketProvider(this.ws)
    this.xdc3 = new Xdc3(this.provider);
    this.reconnect()
    this.reconn()
  }


  reconn() {
    this.reconnInterval = setInterval(() => {
      this.xdc3.eth.net.isListening().then(x => {
        if (!x) this.reconnect()
      }).catch(() => {
        console.log("reconnectable-xdc3", "disconnected");
        this.reconnect()
      })
    }, 5000)
  }

  get status(): Promise<boolean> {
    return this.xdc3.eth.net.isListening()
  }

  get get_xdc3(): Xdc3 {
    return this.xdc3
  }

  disconnect() {
    this.provider.disconnect(0, "test")
    console.log("disconnected reconnectable xdc3");
  }

  reconnect() {
    this.provider = new Xdc3.providers.WebsocketProvider(this.ws)
    this.xdc3 = new Xdc3(this.provider);
  }
}