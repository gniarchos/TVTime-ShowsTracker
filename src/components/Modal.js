import React from "react"
import "./Modal.css"
import { Icon } from "@iconify/react"

export default function Modal(props) {
  const test = Array.from(props.canceled_shows).map((show) => {
    return (
      <div>
        <p className="show_canceled_name">
          <Icon icon="twemoji:television" /> {show}
        </p>
      </div>
    )
  })

  const [style, setStyle] = React.useState("modal")

  React.useEffect(() => {
    setTimeout(function () {
      if (style === "modal" && props.state === true) {
        setStyle("modalShow")
      }
    }, 1500)

    setTimeout(function () {
      if (style === "modalShow" || props.state === false) {
        setStyle("modal")
      }
    }, 200)
  }, [props.state])

  return (
    <div className={style}>
      <div className="modal-content">
        <div className="modal-icon">
          {/* <Icon className="modal-icon" icon="material-symbols:info-rounded" /> */}
          <Icon className="modal-icon" icon="twemoji:crying-face" />
        </div>
        <div className="modal-main">
          <h3>OH NO! It seems that the following show(s) got canceled!</h3>
          {test}
          <button className="modal-button" onClick={() => props.closeModal()}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
