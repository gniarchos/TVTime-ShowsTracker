import React from "react"
import LandingPage from "./components/LandingPage"
import "./app.css"
import Footer from "./components/Footer"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./authentication/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import Home from "./components/Home"
import ShowOverview from "./components/ShowOverview"
import DetailedSliders from "./components/DetailedSliders"
import Profile from "./components/Profile"

export default function App() {
  //
  // const [allMemes, setAllMemes] = React.useState()

  // const [memeImage, setMemeImage] = React.useState("http://i.imgflip.com/1bij.jpg")

  // React.useEffect(() => {
  //     // console.log("Next!")
  //     // fetch("https://api.themoviedb.org/3/search/tv?api_key=47b60aaf43a6f85780c217395976aee5&query=elite")
  //     fetch("https://api.themoviedb.org/3/trending/tv/day?api_key=47b60aaf43a6f85780c217395976aee5&with_networks=213")
  //         .then(res => res.json())
  //         .then(data => console.log(data))
  // }, [])

  // const [isMounted, setIsMounted] = React.useState(false);
  // const [showMain, setShowMain] = React.useState(false);
  const [hideLanding, setHideLanding] = React.useState(false)
  const [hide, setHide] = React.useState(false)

  const mountedStyle = {
    animation: "inAnimation 250ms ease-in",
  }

  const unmountedStyle = {
    animation: "outAnimation 270ms ease-out",
    animationFillMode: "forwards",
  }

  // function showContent() {

  //   // setIsMounted(!isMounted);
  //   setHide(true)

  // }

  // function handleAnimationEnding() {
  //   setHideLanding(true)
  // }

  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            {/* <Route exact path="/" element={<PrivateRoute />}>
                <Route exact path='/' element={<Home/>}/>
              </Route> */}

            {/* <Route exact path="/your-account" element={<PrivateRoute />}>
                <Route exact path='/your-account' element={<YourAccount  />}/>
              </Route> */}

            {/* <Route exact path="/index" element={<PrivateRoute />}> */}
            <Route path="/index" element={<LandingPage />} />
            {/* </Route> */}

            {/* <Route path="/index" element={<Login featuredInfo={featuredInfo}/>} /> */}
            {/* <Route path="/forgot-password" element={<ForgotPassword featuredInfo={featuredInfo}/>} /> */}

            <Route exact path="/" element={<PrivateRoute />}>
              <Route exact path="/" element={<Home />} />
            </Route>

            <Route exact path="/overview" element={<PrivateRoute />}>
              <Route exact path="/overview" element={<ShowOverview />} />
            </Route>

            <Route exact path="/discover" element={<PrivateRoute />}>
              <Route exact path="/discover" element={<DetailedSliders />} />
            </Route>

            <Route exact path="/profile" element={<PrivateRoute />}>
              <Route exact path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>

      {/* {!hideLanding && <div style={hide ? unmountedStyle : null} onAnimationEnd={handleAnimationEnding}> */}
      {/* <LandingPage showContent={showContent}/> */}
      {/* </div>} */}

      {/* <Signup /> */}

      {/* {hideLanding && <TrendingShows />} */}
    </div>
  )
}
