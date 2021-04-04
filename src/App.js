import React, { useState, useEffect } from 'react';
import './App.css';
import Nav from './components/Nav'
import Chart from 'chart.js'
import Ticker from './components/Ticker';
import Notify from './components/Notify';

const conf = {
  // using ASP .NET Core 5 WEB API application running on local machine on port 44338
  // API address is SERVER_BASE_URL + '/api/[Controller]'
  SERVER_BASE_URL: "https://localhost:44338"
}
// "global" variables
let cryptoCharts = {};
let ctx = {};
let chartValuesArray = [];
let chartLabelsArray = [];
let cryptoItems = [];
let chartPeriodSeconds = 21600;

// for listening ENTER keydown event - clear input, call tickers adding function
const Input = function (e) {
  const handleKeyDown = function (event) {
    if (event.key === 'Enter') {
      e['callback']();
    }
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
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      },
      animation: false
    }
  });
}


// main app
function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  //const [cryptoItems, setCryptoItems] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(1);
  //const [chartPeriodSeconds, setChartPeriod] = useState(21600); // default 60 (sec) * 60 (min) * 6 (hours) = 21600
  // eslint-disable-next-line
  const [cryptoChartValues, setCryptoChartValues] = useState([]);
  // data array for charts

  // Refreshing the document using React useEffect
  // eslint-disable-next-line
  useEffect(() => {
    ctx = document.getElementById('cryptoCharts').getContext('2d');


    //  let xcryptoCharts = new Chart(ctx, {
    //     type: 'bar',
    //     // data: {
    //     //   labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //     //   datasets: [{
    //     //     label: '# of Votes',
    //     //     data: [12, 19, 3, 5, 2, 3],
    //     //     backgroundColor: [
    //     //       'rgba(255, 99, 132, 0.2)',
    //     //       'rgba(54, 162, 235, 0.2)',
    //     //       'rgba(255, 206, 86, 0.2)',
    //     //       'rgba(75, 192, 192, 0.2)',
    //     //       'rgba(153, 102, 255, 0.2)',
    //     //       'rgba(255, 159, 64, 0.2)'
    //     //     ],
    //     //     borderColor: [
    //     //       'rgba(255, 99, 132, 1)',
    //     //       'rgba(54, 162, 235, 1)',
    //     //       'rgba(255, 206, 86, 1)',
    //     //       'rgba(75, 192, 192, 1)',
    //     //       'rgba(153, 102, 255, 1)',
    //     //       'rgba(255, 159, 64, 1)'
    //     //     ],
    //     //     borderWidth: 1
    //     //   }]
    //     // },
    //     data: {
    //       datasets: [{
    //         label: 'BTC',
    //         data: [40, 30, 30, 20, 20, 10, 30, 40, 20, 30, 40, 20, 30, 40, 20, 10, 30, 40, 20, 30],
    //         backgroundColor: [
    //           'rgba(255, 99, 132, 0.0)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)',
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)'
    //         ],
    //         borderColor: [
    //           'rgba(255, 99, 132, 1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)',
    //           'rgba(255, 99, 132, 1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)'
    //         ],

    //         // Changes this dataset to become a line
    //         type: 'line'
    //       }, {
    //         label: 'Third',
    //         data: [40, 10, 20, 30, 10, 20, 10, 20, 30, 10, 20, 10, 30, 10, 20, 30, 30, 10, 20, 30, 40],
    //         backgroundColor: [
    //           'rgba(155, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)',
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)'
    //         ],
    //         borderColor: [
    //           'rgba(0, 0, 0, 0)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)',
    //           'rgba(255, 99, 132, 1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)'
    //         ],

    //       }, {
    //         label: 'Bar Dataset',
    //         data: [40, 10, 20, 30, 10, 20, 10, 20, 30, 10, 20, 10, 30, 10, 20, 30, 30, 10, 20, 30, 40],
    //         backgroundColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)',
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)'
    //         ],
    //         borderColor: [
    //           'rgba(255, 99, 132, 1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)',
    //           'rgba(255, 99, 132, 1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)'
    //         ],
    //         showLine: true
    //       }],
    //       labels: ['January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'Sept', 'Nov', 'Dec', 'January', 'February', 'March', 'April', 'Mai', 'June', 'July', 'August', 'Sept', 'Nov', 'Dec']
    //     },
    //     options: {
    //       scales: {
    //         yAxes: [{
    //           ticks: {
    //             beginAtZero: true
    //           }
    //         }]
    //       },
    //       animation: false
    //     }
    //   });

    hideNodejsWarning(cryptoCharts);

    // on first page load tickers
    if (!isLoaded) {
      updateTickers();
      document.getElementById('chartPeriod').value = '06:00';
      setIsLoaded(true);
    }

    // tickers update timer
    const token = setTimeout(updateTime, 1000);
    return function cleanUp() {
      clearTimeout(token);
    }
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
    postData(conf.SERVER_BASE_URL + '/api/CryptoItems', "")
      .then((data) => {
        //console.log(data); 
        //setCryptoItems(data);
        cryptoItems = data;
        historicalPeriodChange();

      });
  }

  function addCrypto() {
    let NewCryptoItem = document.getElementById("input_AddCryptocurrency").value;
    postData(conf.SERVER_BASE_URL + '/api/CryptoItems', NewCryptoItem)
      .then((data) => {
        //console.log(data); 
        //setCryptoItems(data);
        cryptoItems = data;
        historicalPeriodChange();
      });
    document.getElementById('input_AddCryptocurrency').value = "";
  }

  async function postData(url = '', data = {}, reqMethod = "POST") {
    const response = await fetch(url, { // Default options are marked with *
      method: reqMethod, // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, errors
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).catch(err => {
      Notify('[GET TICKERS] API server connection error - ' + err, 'danger')
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
      Notify('[SET PERIOD] API server connection error - ' + err, 'danger')
      return new Promise(res => JSON.parse('[]'))
    })

    return await response.json();
  }

  function hideNodejsWarning(variable) {/* do nothing */ }

  function setChartPeriod(e) {
    const inputValue = e.target.value;
    chartPeriodSeconds = parseInt(inputValue.split(':')[0]) * 60 * 60 + parseInt(inputValue.split(':')[1]) * 60;
    console.log('ChartPeriod:', chartPeriodSeconds);
    historicalPeriodChange();
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
    // crypto = {BaseCrypto: "BTC", ID: 49, CryptoName: "ADA", LastTradeRate: "0,00002045", TradeRateDate: "2021-04-04T21:06:57.033"}
    cryptoItems.forEach(crypto => {
      console.log('crypto: ', crypto);
      chartLabelsArray = [];
      const rndColor = function () { return `rgba(${Math.floor(Math.random() * 255) + 1}, ${Math.floor(Math.random() * 255) + 1}, ${Math.floor(Math.random() * 255) + 1}, 0.1)` }
      chartLabelsArray.push(crypto.CryptoName);
      // let backgroundColorArr = [], borderColorArr = [];
      // for (let i = 0; i < cryptoItems.length; i++) {
      //   backgroundColorArr.push(rndColor());
      //   borderColorArr.push(rndColor());
      // }
      let rndCryptoColor = rndColor();
      let rndCryptoBorderColor = rndColor();
      // useing recursion for sorted chart view
      const 

      getChartsDataArray(crypto.ID, function (data) {
        let datasetItem = { label: '', data: [], backgroundColor: rndCryptoColor, borderColor: rndCryptoBorderColor, borderWidth: 2 };
        //datasetItem.data = [];
        datasetItem.label = crypto.CryptoName;
        // collect charts data into one array
        // let oldArr = cryptoChartValues;
        // oldArr.push(data);
        data.forEach(cr => {
          //datasets.push();
          datasetItem.data.push(cr.MarketValue);
        });
        chartValuesArray.push(datasetItem);
        cryptoCharts = getChart(ctx, 'bar');
        //cryptoCharts.update()
        console.log('chartValuesArray: ', chartValuesArray);
        // setCryptoChartValues(oldArr);
        // cryptoitem = {CryptoName: "ADA", BaseCrypto: "BTC", Id: 1705, CurrencyID: 49, MarketValue: 0.00002038, HistoryDate: "2021-04-04T10:46:43.02"}
        //console.log('data: ', data);
      }).then(e => {
        console.log('chartLabelsArray: ', chartLabelsArray);
      });
    });
    //console.dir('cryptoChartValues', chartValuesArray);
  }

  // receive values array data for charts by crypto items `ID`
  // {ID: 45, BaseCrypto: "BTC", CryptoName: "LTC", LastTradeRate: "0,00350531", TradeRateDate: "2021-04-04T13:53:54.697"}
  // returns {Id: 1699, CurrencyID: 45, MarketValue: 0.00347115, HistoryDate: "2021-04-04T10:46:12.77"}
  async function getChartsDataArray(cryptoCurrencyItemID, callback) {
    return await getData(conf.SERVER_BASE_URL + '/api/CryptoValues/' + cryptoCurrencyItemID)
      .then((data) => {
        console.log('/api/CryptoValues/', data); // JSON data parsed by `response.json()` call
        callback(data)
      });
  }

  return (
    <div className="App">
      <Nav />
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
                  <label htmlFor="tickers" className="h5 block text-sm font-medium text-gray-700 mt-1">Tickers</label>
                  <div className="row" id="tickers">

                    {cryptoItems.map((cryptoitem, idx) => {
                      return <Ticker cryptoitem={cryptoitem} funcUpdate={updateTickers} key={cryptoitem.ID} />
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
                        <label className="sr-only text-muted h5" htmlFor="chartPeriod">Historical change in markets over the period (HH:mm scrollable):</label>
                      </div>
                      <div className="col-auto">
                        <input className="form-control" onChange={setChartPeriod} type="time" id="chartPeriod" min="00:00" max="24:00" name="chartPeriod" />
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