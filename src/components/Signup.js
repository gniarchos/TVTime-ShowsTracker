import React from "react"
import "./Signup.css"
import eye_off from "../images/eye-off.png"
import eye from "../images/eye.png"
import name from "../images/input-id.png"
import email from "../images/email.png"
import user from "../images/user.png"
import { useAuth } from "../authentication/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Signup() {
  document.title = "TVTime | Signup "

  const [mustShowPass, setMustShowPass] = React.useState(false)
  const [error, setError] = React.useState("")

  const usernameRef = React.useRef()
  const emailRef = React.useRef()
  const fnameRef = React.useRef()
  const lnameRef = React.useRef()
  const passwordRef = React.useRef()
  const passwordConfirmRef = React.useRef()
  const { signup, currentUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match!")
    }

    try {
      setError("")
      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        usernameRef.current.value,
        fnameRef.current.value,
        lnameRef.current.value
      )
      navigate("/")
    } catch {
      setError("Failed to creat an account")
    }
  }

  function togglePasswordVisibility() {
    setMustShowPass(!mustShowPass)
  }

  const toggleStyleHidden = {
    display: mustShowPass ? "none" : "block",
  }

  const toggleStyleVisible = {
    display: !mustShowPass ? "none" : "block",
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-bg">
        <form onSubmit={handleSubmit} className="form-div-signup">
          <h1>Create an Account</h1>
          <div className="div-field">
            <input
              className="input-text name"
              type="text"
              placeholder="First Name*"
              ref={fnameRef}
              required
            />
            <span className="span-img">
              <img className="email-img" src={name} alt="name" />
            </span>
            <input
              className="input-text name"
              type="text"
              placeholder="Last Name*"
              ref={lnameRef}
              required
            />
            <span className="span-img">
              <img className="email-img" src={name} alt="name" />
            </span>
          </div>
          <div className="div-field">
            <input
              className="input-text user"
              type="text"
              placeholder="Username*"
              ref={usernameRef}
              required
            />
            <span className="span-img">
              <img className="email-img" src={user} alt="name" />
            </span>
            <input
              className="input-text email"
              type="email"
              placeholder="Email*"
              ref={emailRef}
              required
            />
            <span className="span-img">
              <img className="email-img" src={email} alt="email" />
            </span>
          </div>
          <div className="div-field pass-field">
            <input
              className="input-text password"
              type={mustShowPass ? "text" : "password"}
              placeholder="Password*"
              ref={passwordRef}
              pattern=".{6,}"
              title="Password must be at least 6 characters"
              required
            />
            <span className="span-img" onClick={togglePasswordVisibility}>
              <img
                style={toggleStyleHidden}
                className="eye-off-img"
                src={eye_off}
                alt="eye-off"
              />
            </span>
            <span className="span-img" onClick={togglePasswordVisibility}>
              <img
                style={toggleStyleVisible}
                className="eye-img"
                src={eye}
                alt="eye"
              />
            </span>

            <input
              className="input-text password"
              type={mustShowPass ? "text" : "password"}
              placeholder="Confirm Password*"
              ref={passwordConfirmRef}
              pattern=".{6,}"
              title="Password must be at least 6 characters"
              required
            />
            <span className="span-img" onClick={togglePasswordVisibility}>
              <img
                style={toggleStyleHidden}
                className="eye-off-img"
                src={eye_off}
                alt="eye-off"
              />
            </span>
            <span className="span-img" onClick={togglePasswordVisibility}>
              <img
                style={toggleStyleVisible}
                className="eye-img"
                src={eye}
                alt="eye"
              />
            </span>
          </div>

          <button className="signup-btn"> Sign up </button>
        </form>
      </div>
    </div>
  )
}
