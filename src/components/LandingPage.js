import React from "react"
import "./LandingPage.css"
import Login from "./Login"
import { Icon } from "@iconify/react"
import Signup from "./Signup"
import Navbar from "./Navbar"
import Footer from "./Footer"

export default function LandingPage(props) {
  const [showLoginPage, setShowLoginPage] = React.useState(false)
  const [showLogin, setShowLogin] = React.useState(false)

  const [hideStarting, setHideStarting] = React.useState(false)

  const [showSignUpPage, setShowSignUpPage] = React.useState(false)
  const [showSignUp, setShowSignUp] = React.useState(false)

  const [calledFrom, setCalledFrom] = React.useState("")

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function handleAnimationEnding() {
    if (calledFrom === "login") {
      setShowLoginPage(true)
      setShowLogin(true)
      setShowSignUp(false)
    } else if (calledFrom === "signup") {
      setShowSignUpPage(true)
      setShowSignUp(true)
      setShowLogin(false)
    }
  }

  function goToLogin() {
    setHideStarting(true)
    setCalledFrom("login")
  }

  function goToSignUp() {
    setHideStarting(true)
    setCalledFrom("signup")
  }

  function switchToLogin() {
    setShowLogin(true)
    setShowSignUp(false)

    setShowLoginPage(true)
    setShowSignUpPage(false)
  }

  function switchToSignUp() {
    setShowLogin(false)
    setShowSignUp(true)

    setShowLoginPage(false)
    setShowSignUpPage(true)
  }

  const unmount = {
    animation: "outAnimationLanding 270ms ease-out",
    animationFillMode: "forwards",
  }

  const mount = {
    animation: "inAnimationLanding 270ms ease-out",
    animationFillMode: "forwards",
  }

  return (
    <>
      <div className="bg"></div>
      <Navbar
        showLogin={showLogin}
        goToLogin={goToLogin}
        goToSignUp={goToSignUp}
        hideStarting={hideStarting}
        switchToLogin={switchToLogin}
        switchToSignUp={switchToSignUp}
      />
      <div className="landing-wrapper">
        {!showLoginPage && !showSignUpPage && (
          <div
            className="content"
            style={hideStarting ? unmount : null}
            onAnimationEnd={handleAnimationEnding}
          >
            <h1 className="landing-title">Tracking Shows Made Easy</h1>
            <div>
              <h2 className="item frame-1">
                <b>TRACK</b> the shows you love
              </h2>
              <h2 className="item frame-2">
                <b>FIND</b> what to watch next
              </h2>
              <h2 className="item frame-3">
                <b>DISCOVER</b> trending shows
              </h2>
            </div>
            <div className="button-start-div">
              <button onClick={goToSignUp} className="button-start">
                Get Started
                <div className="icon">
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {showSignUpPage && (
          <div style={showSignUp ? mount : null}>
            <Signup />
          </div>
        )}

        {showLoginPage && (
          <div style={showLogin ? mount : null}>
            <Login />
          </div>
        )}
      </div>

      {!showLoginPage && !showSignUpPage && (
        <div className="about-landing">
          <div>
            <img
              className="popcorn-img"
              src="https://media.giphy.com/media/AuZXGzk5qKRpG54Ewl/giphy.gif"
              alt="popcorn"
            />
          </div>

          <div className="about-div">
            <h1 className="about-h1">
              Let TVTime be your <br /> guide
            </h1>
            <h2 className="features-h2">
              <Icon icon="heroicons-outline:badge-check" width={50} />
              Trending Shows
            </h2>
            <h2 className="features-h2">
              <Icon icon="heroicons-outline:badge-check" width={50} />
              Popular Shows
            </h2>
            <h2 className="features-h2">
              <Icon icon="heroicons-outline:badge-check" width={50} />
              Shows Detailed Info
            </h2>
            <h2 className="features-h2">
              <Icon icon="heroicons-outline:badge-check" width={50} />
              Track Episodes
            </h2>
            <h2 className="features-h2">
              <Icon icon="heroicons-outline:badge-check" width={50} />
              Casts & Crew
            </h2>
            <button
              className="btn-learn-more"
              onClick={() => window.scrollTo(0, 0)}
            >
              JOIN US TO FIND MORE
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
