import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga4";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactGA.initialize("395730461");
ReactGA.send({
  hitType: "pageview",
  page: window.location.pathname + window.location.search,
});

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
