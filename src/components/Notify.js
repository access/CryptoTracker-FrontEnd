import * as bootstrap from 'bootstrap'

function Notify(message, notifyType = "dark") {
  let innerCode =
    `<div class="alert alert-${notifyType}" role="alert" id="notify">
      ${message}
    </div>`;

  let container = document.getElementById('notifyContainer');
  container.innerHTML = innerCode;
  const el = document.getElementById('notify');
  const alert = new bootstrap.Alert(el);
  if (message)
    setTimeout(function () { alert.close() }, 5000);
  else
    alert.close();
}

export default Notify;