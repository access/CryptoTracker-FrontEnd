import React from 'react'

function Nav({ setChartType }) {
  return (
    <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <a className="navbar-brand" href="/">CryptoTracker <sup><span className="badge rounded-pill bg-secondary text-info">by Jevgeni Kostenko</span></sup></a>
        </div>

        <div className="d-flex justify-content-center">
          <div className="row align-items-center">
            <div className="col-auto">
              <label className="sr-only text-light h6" htmlFor="chartType">Select the type of charts</label>
            </div>
            <div className="col-auto">
              <div className="input-group">
                <select className="form-select" id="chartType" name="chartType" onChange={setChartType}>
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;