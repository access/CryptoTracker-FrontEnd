import React from 'react'
import { Config } from '../App';
import Notify from './Notify';

function Date2String(str) {
  let date = new Date(str);
  let dateStr = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)))
    + '.' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
    + '.' + date.getFullYear()
    + ' ' + ((date.getHours() > 9) ? date.getHours() : ('0' + date.getHours()))
    + ':' + ((date.getMinutes() > 9) ? date.getMinutes() : ('0' + date.getMinutes()))
    + ':' + ((date.getSeconds() > 9) ? date.getSeconds() : ('0' + date.getSeconds()));
  return dateStr;
}

function deleteCryptoItem(cryptoID, callback) {
  deleteData(Config.SERVER_BASE_URL + '/api/CryptoItems/' + cryptoID)
    .then((data) => {
      callback();
    });
}

async function deleteData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }).catch(err => {
    Notify('[REMOVE TICKER] API server connection error - ' + err, 'danger')
    return new Promise(res => JSON.parse('[]'))
  });
  return await response.json();
}

function Ticker({ cryptoitem, funcUpdate }) {
  return (
    <div className="col-sm col-md col-lg">
      <div className="card ticker m-1">
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-muted">{cryptoitem.CryptoName} - {cryptoitem.BaseCrypto}</h6>
          <h5 className="card-title">{cryptoitem.LastTradeRate}</h5>
          <small><p className="card-text text-muted text-small text-wrap">{Date2String(cryptoitem.TradeRateDate)}</p></small>
          <button type="button" className="btn btn-outline-dark border-0 mt-2" onClick={() => deleteCryptoItem(cryptoitem.ID, funcUpdate)}><i className="bi bi-trash"></i> Remove</button>
        </div>
      </div>

    </div>

  );
}

export default Ticker;