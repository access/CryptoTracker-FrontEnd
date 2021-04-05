import React, { useState, useEffect, useReducer } from 'react';
import './App.css';
import Nav from './components/Nav'
import Chart from 'chart.js'
import Ticker from './components/Ticker';
import Notify from './components/Notify';

const conf = {
  // using ASP .NET Core 5 WEB API application running on local machine on port 44338
  // API address is SERVER_BASE_URL + '/api/[Controller]'
  SERVER_BASE_URL: "https://localhost:44338",
  cursorX: 0,
  cursorY: 0,
  //------------------
  ActiveTickerID: 0,
  ActiveTickerCryptoCurrencyName: '',
  ActiveTickerBaseCrypto: '',
  //------------------
  UserChartsType: 'bar'
}

document.onmousemove = function (event) {
  conf.cursorX = event.pageX;
  conf.cursorY = event.pageY;
};

// "global" variables
let cryptoCharts = { destroy: () => { } };
let ctx = {};
let chartValuesArray = [];
let chartLabelsArray = [];
let cryptoItems = [];
let chartPeriodSeconds = 21600;
let chartBackgroundColors = [];
let chartBorderColors = [];

// for listening ENTER keydown event - clear input, call tickers adding function
const Input = function (e) {
  const handleKeyDown = function (event) {
    if (event.key === 'Enter')
      e['callback']();
  }
  return <input type="text" className="form-control" placeholder="Ex. DOGE" id="input_AddCryptocurrency" onKeyDown={handleKeyDown} />
}

function getChart(ctx, chartType = 'bar') {
  // dataset object = {Id: 1699, CurrencyID: 45, MarketValue: 0.00347115, HistoryDate: "2021-04-04T10:46:12.77"}
  return new Chart(ctx, {
    type: chartType,
    data: {
      datasets: chartValuesArray,
      labels: chartLabelsArray
    },
    options: {
      responsive: true,
      normalized: false,
      maintainAspectRatio: true,
      // animation: {
      //   duration: 0
      // },
      // hover: {
      //   animationDuration: 0
      // },
      //responsiveAnimationDuration: 0,
      // legend: {
      //   display: false
      // },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          display: false //this will remove all the x-axis grid lines
        }],
        // x: {
        //   stacked: true,
        // },
        // y: {
        //   stacked: true
        // }
      },
      //animation: false,
      //hover:false
    }
  });
}

// main app
function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(1);
  // eslint-disable-next-line
  const [cryptoChartValues, setCryptoChartValues] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Refreshing the document using React useEffect
  // eslint-disable-next-line
  useEffect(() => {
    ctx = document.getElementById('cryptoCharts').getContext('2d');
    hideNodejsWarning(cryptoCharts);

    // on first page load tickers
    if (!isLoaded) {
      updateTickers();
      document.getElementById('chartPeriod').value = '06:00';
      setIsLoaded(true);
    }

    // tickers update timer
    const token = setTimeout(updateTime, 1000);
    return function cleanUp() { clearTimeout(token); }
  });

  function updateTime() {
    if (minutes === 0 && seconds === 0) {
      //reset UPDATE time
      setSeconds(0);
      setMinutes(1);
      document.getElementById("updateTimeleftProgress").style = "width:100%";
      updateTickers();
    }
    else {
      if (seconds === 0) {
        setMinutes(minutes => minutes - 1);
        setSeconds(59);
      } else {
        setSeconds(seconds => seconds - 1);
      }
    }
    // set update progress bar
    // calculate width in '%' with period one minute
    let progressBarWidth = 100 / 60 * (seconds + minutes * 60); // 1 percent * (all seconds) 
    document.getElementById("updateTimeleftProgress").style = "width:" + progressBarWidth + "%";
  };

  // receive all crypto items from server, set state values
  function updateTickers() {
    // if ticker is selected 
    if (conf.ActiveTickerID !== 0) {
      setActiveChart(conf.ActiveTickerID, conf.ActiveTickerCryptoCurrencyName, conf.ActiveTickerBaseCrypto);
    } else {
      postData(conf.SERVER_BASE_URL + '/api/CryptoItems', "")
        .then((data) => {
          cryptoItems = data;
          historicalPeriodChange();
        });
    }
  }

  function addCrypto() {
    let NewCryptoItem = document.getElementById("input_AddCryptocurrency").value;
    postData(conf.SERVER_BASE_URL + '/api/CryptoItems', NewCryptoItem)
      .then((data) => {
        cryptoItems = data;
        historicalPeriodChange();
      });
    document.getElementById('input_AddCryptocurrency').value = "";
  }

  async function postData(url = '', data = {}, reqMethod = "POST") {
    const response = await fetch(url, {
      method: reqMethod,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    }).catch(err => {
      Notify(`[GET TICKERS] API server (${conf.SERVER_BASE_URL}) connection error - ${err}`, 'danger')
      return new Promise(res => JSON.parse('[]'))
    })
    return await response.json();
  }

  async function getData(url = '') {
    const response = await fetch(url, {
      method: "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    }).catch(err => {
      Notify(`[SET PERIOD] API server (${conf.SERVER_BASE_URL}) connection error - ${err}`, 'danger')
      return new Promise(res => JSON.parse('[]'))
    })

    return await response.json();
  }

  function hideNodejsWarning(variable) {/* do nothing */ }

  function setChartPeriod(e) {
    const inputValue = e.target.value;
    chartPeriodSeconds = parseInt(inputValue.split(':')[0]) * 60 * 60 + parseInt(inputValue.split(':')[1]) * 60;
    updateTickers();
  }

  function historicalPeriodChange() {
    chartValuesArray = [];
    /* 
    -------------------------
    DATASET Object 
    -------------------------
      datasets: [{
        label: cryptoName,
        data: [1,2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.0)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        type: 'line'
      }],
    */

    let cryptoItemsCount = cryptoItems.length;
    let currentCryptoProcessed = 0;
    chartLabelsArray = [];
    chartValuesArray = [];
    const rndColor = function () { return `rgba(${Math.floor(Math.random() * 255) + 1}, ${Math.floor(Math.random() * 255) + 1}, ${Math.floor(Math.random() * 255) + 1}, 0.1)` }
    // let rndCryptoColor = rndColor();
    // let rndCryptoBorderColor = rndColor();
    if (chartBackgroundColors.length !== cryptoItemsCount && chartBorderColors.length !== cryptoItemsCount) {
      chartBackgroundColors = [];
      chartBorderColors = [];
      cryptoItems.forEach(c => {
        chartBackgroundColors.push(rndColor());
        chartBorderColors.push(rndColor());
      });
    }
    // using recursion when getting data of cryptocurrency for sorted chart view of crypto items
    // crypto = {BaseCrypto: "BTC", ID: 49, CryptoName: "ADA", LastTradeRate: "0,00002045", TradeRateDate: "2021-04-04T21:06:57.033"}
    const processCryptoItem = function (crypto) {
      if (crypto === undefined) return;
      cryptoItems.forEach(item => {
        chartLabelsArray.push('BaseCrypto: ' + crypto.BaseCrypto);
      });

      getChartsDataArray(crypto.ID, function (data) {
        let datasetItem = { label: '', data: [], backgroundColor: chartBackgroundColors[currentCryptoProcessed], borderColor: chartBorderColors[currentCryptoProcessed], borderWidth: 2 };
        datasetItem.label = crypto.CryptoName;
        // collect charts data into one array
        data.forEach(cr => {
          datasetItem.data.push(cr.MarketValue);
        });
        chartValuesArray.push(datasetItem);
      }).then(e => {
        currentCryptoProcessed++;
        if (currentCryptoProcessed < cryptoItemsCount) {
          processCryptoItem(cryptoItems[currentCryptoProcessed]);
        } else {
          cryptoCharts.destroy();
          cryptoCharts = getChart(ctx, conf.UserChartsType);
          cryptoCharts.update();
        }
      });
    };
    processCryptoItem(cryptoItems[currentCryptoProcessed]);
  }

  // receive values array data for charts by crypto items `ID`
  // {ID: 45, BaseCrypto: "BTC", CryptoName: "LTC", LastTradeRate: "0,00350531", TradeRateDate: "2021-04-04T13:53:54.697"}
  // returns {Id: 1699, CurrencyID: 45, MarketValue: 0.00347115, HistoryDate: "2021-04-04T10:46:12.77"}
  async function getChartsDataArray(cryptoCurrencyItemID, callback) {
    return await getData(conf.SERVER_BASE_URL + '/api/CryptoValues/' + cryptoCurrencyItemID + '/' + chartPeriodSeconds)
      .then((data) => {
        callback(data);
      });
  }

  function appRerender() {
    updateTickers();
    forceUpdate();
  }

  function setActiveChart(cryptoID, cryptoName, baseCrypto) {
    conf.ActiveTickerID = cryptoID;
    conf.ActiveTickerCryptoCurrencyName = cryptoName;
    conf.ActiveTickerBaseCrypto = baseCrypto;
    const rndColor = function () { return `rgba(${Math.floor(Math.random() * 255) + 1}, ${Math.floor(Math.random() * 255) + 1}, ${Math.floor(Math.random() * 255) + 1}, 0.1)` }
    chartLabelsArray = [];
    chartValuesArray = [];
    //document.getElementById('cryptoCharts').innerHTML = '';

    getChartsDataArray(cryptoID, function (data) {
      data.forEach(cryptoValue => {
        chartLabelsArray.push(cryptoName + ' - ' + baseCrypto);
      });
      //console.log('data: ', data);
      let datasetItem = { label: '', data: [], backgroundColor: rndColor(), borderColor: 'rgba(0, 0, 0, 0.15)', borderWidth: 2 };
      datasetItem.label = cryptoName;
      // collect charts data into one array
      data.forEach(cr => {
        datasetItem.data.push(cr.MarketValue);
      });
      chartValuesArray.push(datasetItem);
    }).then(e => {
      //if (cryptoCharts.length === 0)
      cryptoCharts.destroy();
      cryptoCharts = getChart(ctx, conf.UserChartsType);
      cryptoCharts.update();
    });
    forceUpdate();
  }

  function setChartType(e) {
    conf.UserChartsType = e.target.value;
    updateTickers();
  }

  return (
    <div className="App">
      <Nav
        setChartType={setChartType}
      />
      <div id="notifyContainer"></div>
      <div className="container">
        <div className="card m-3 p-1 container-fluid">
          <div className="row flex-nowrap m-1">

            <div className="col-4" >

              {/* left side */}
              <div className="card h-100 border-0">
                <div className="card-body">
                  {/* INPUT ADD CURRENCY */}
                  <label htmlFor="input_AddCryptocurrency" className="h5 block text-sm font-medium text-gray-700 my-2">New Ticker</label>
                  <Input callback={addCrypto} />
                  <button type="button" className="btn btn-lg btn-outline-dark mt-3" onClick={() => addCrypto}>Add Cryptocurrency</button>



                  {/* PROGRESS TICK TIMER */}
                  <hr className="w-full border-t border-gray-600 mt-4 mb-2" />
                  <div className="progress" style={{ height: "0.7em" }}>
                    <div id="updateTimeleftProgress" className="progress-bar progress-bar-striped bg-success" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="60"></div>
                  </div>
                  <p className="h5 text-muted">Seconds left before update:
                  <span className="badge rounded-pill bg-light text-dark mt-2">
                      00:{minutes > 9 ? minutes : '0' + minutes}:{seconds > 9 ? seconds : '0' + seconds}
                    </span>
                  </p>
                  <hr className="w-full border-t border-gray-600 mt-2" />

                  {/* TICKERS */}
                  <label htmlFor="tickers" className="h5 block text-sm font-medium text-gray-700 m-1">Tickers</label>
                  <p className="text-success m-1 fw-bold">Select a ticker to view its graph</p>
                  <div className="row" id="tickers">

                    {cryptoItems.map((cryptoitem, idx) => {
                      return <Ticker
                        cryptoitem={cryptoitem}
                        funcUpdate={updateTickers}
                        selected={(cryptoitem.ID === conf.ActiveTickerID)}
                        setActiveChart={setActiveChart}
                        appRerender={appRerender}
                        key={cryptoitem.ID} />
                    })}

                  </div>
                </div>
              </div>
            </div>

            <div className="col-8">

              {/* right side */}
              <div className="card h-100 border-0">
                <div className="card-body">

                  {/* HISTRORICAL PERIOD CHOOSE */}
                  <div className="d-flex justify-content-center">
                    <div className="row g-3 align-items-center">
                      <div className="col-auto">
                        <label className="sr-only text-muted h5" htmlFor="chartPeriod">Historical change in markets over the period (scrollable):</label>
                      </div>
                      <div className="col-auto">
                        <div className="input-group">
                          <span className="input-group-text text-dark" id="basic-addon1">HH:mm</span>
                          <input className="form-control" onChange={setChartPeriod} type="time" id="chartPeriod" aria-describedby="basic-addon1" name="chartPeriod" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CHARTS */}
                  <canvas id="cryptoCharts" className="w-100 h-100"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
export const Config = conf;