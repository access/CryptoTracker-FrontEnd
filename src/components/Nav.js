import React from 'react'

function Nav() {
  return (
    <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <a className="navbar-brand" href="http://www.com">CryptoTracker <sup><span className="badge rounded-pill bg-secondary text-info">by Jevgeni Kostenko</span></sup></a>
        </div>
      </div>
    </nav>
  );
}

export default Nav;