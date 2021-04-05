import React from 'react';
import { Config } from '../App';
import Notify from './Notify';
import * as bootstrap from 'bootstrap'

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
    Notify(`[REMOVE TICKER] API server (${Config.SERVER_BASE_URL}) connection error - ${err}`, 'danger')
    return new Promise(res => JSON.parse('[]'))
  });
  return await response.json();
}

let modalConfirmRemove = {};

function Ticker({ cryptoitem, funcUpdate, selected, setActiveChart, appRerender }) {
  let tickerModalID = "removeConfirm" + cryptoitem.ID + cryptoitem.CryptoName;
  let tickerModalDialogID = "removeModalDialog" + cryptoitem.ID + cryptoitem.CryptoName;

  function deleteCryptoItem(cryptoID, callback) {
    deleteData(Config.SERVER_BASE_URL + '/api/CryptoItems/' + cryptoID)
      .then((data) => {
        callback();
      });
    modalConfirmRemove.hide();
    Config.ActiveTickerID = 0;
  }

  function removeTickerConfirm(cryptoID) {
    modalConfirmRemove = new bootstrap.Modal(document.getElementById(tickerModalID), {
      //keyboard: false
    });
    const removeModal = document.getElementById(tickerModalID);
    removeModal.addEventListener('shown.bs.modal', function (event) {
      const removeModalDialog = document.getElementById(tickerModalDialogID);
      removeModalDialog.style.margin = (Config.cursorY - 250) + "px " + (Config.cursorX - 250) + "px";
    });
    modalConfirmRemove.show();
  }

  // toggle if already selected same ticker
  function handleTickerClick(e) {
    if (Config.ActiveTickerID === cryptoitem.ID) {
      Config.ActiveTickerID = 0;
      appRerender();
    } else {
      setActiveChart(cryptoitem.ID, cryptoitem.CryptoName, cryptoitem.BaseCrypto)
    }
  }

  function removeTicker(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    removeTickerConfirm(cryptoitem.ID)
  }

  return (
    <div className="col-sm col-md col-lg">
      <div className={selected ? "card ticker m-1 ticker-selected border border-dark border-3" : "card ticker m-1"} onClick={handleTickerClick}>
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-muted">{cryptoitem.CryptoName} - {cryptoitem.BaseCrypto}</h6>
          <h5 className="card-title">{cryptoitem.LastTradeRate}</h5>
          <small><p className="card-text text-muted text-small text-wrap">{Date2String(cryptoitem.TradeRateDate)}</p></small>
          <button type="button" className="btn btn-outline-dark border-0 mt-2" onClick={removeTicker}><i className="bi bi-trash"></i> Remove</button>
        </div>
      </div>

      {/* MODAL */}
      <div className="modal" tabIndex="-1" id={tickerModalID}>
        <div className="modal-dialog" id={tickerModalDialogID} data-tor-position="left middle">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Remove Crypto Ticker</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <h4><span className="badge badge-lg rounded-pill bg-secondary">Ticker: [{cryptoitem.CryptoName + ' - ' + cryptoitem.BaseCrypto}]</span></h4>
              <p className="h5">Are you sure you want to remove this ticker?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-outline-danger" onClick={() => deleteCryptoItem(cryptoitem.ID, funcUpdate)}>Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticker;