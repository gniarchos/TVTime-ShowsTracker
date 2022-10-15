import React from "react"
import "./Footer.css"
import api_logo from "../images/api-logo.png"
import imdb_api_logo from "../images/imdb-api-logo.png"

export default function Footer() {
  return (
    <div className="footer-wrapper">
      <h4 className="copyright">© 2022 - Giannis Niarchos</h4>

      <div className="footer-api">
        <h4>Powered by </h4>
        <img width={50} height={50} src={api_logo} alt="api-logo" />
        <img width={50} height={50} src={imdb_api_logo} alt="imdb-api-logo" />
      </div>
    </div>
  )
}
