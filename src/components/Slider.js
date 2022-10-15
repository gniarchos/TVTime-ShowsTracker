import React from "react"
import "./Slider.css"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../authentication/AuthContext"

export default function Slider(props) {
  document.title = "TVTime | TV Shows Tracker"

  const show_title = React.useRef("")
  const divRef = React.useRef("")
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  function goToShow(showID) {
    fetch(
      `https://api.themoviedb.org/3/tv/${showID}?api_key=47b60aaf43a6f85780c217395976aee5&language=en-US&append_to_response=external_ids,videos,aggregate_credits,content_ratings,recommendations,similar,watch/providers,images`
    )
      .then((res) => res.json())
      .then((data) => {
        navigate("/overview", {
          state: {
            data: data,
            userId: currentUser.uid,
          },
        })
      })
  }

  const list = props.listOfShows.slice(0, 12).map((list, index) => {
    return (
      <div
        onClick={() => goToShow(list.id)}
        key={list.id}
        className="slider-content"
      >
        {props.section !== "Discover" && props.section !== "On The Air" && (
          <p className="slider-num">{index + 1}</p>
        )}
        <div className="cards-wrapper">
          <div className="img-trend-container">
            <img
              className="slider-img"
              src={`https://image.tmdb.org/t/p/w500/${list.poster_path}`}
            />
          </div>

          <p ref={show_title} className="slider-title">
            {list.name}
          </p>
        </div>
      </div>
    )
  })

  return (
    <>
      <div>
        <div className="title-link">
          <h1 className="slider-section">{props.section}</h1>
          <button
            className="viewMore-button"
            onClick={() => props.toggleFindMore(props.section)}
          >
            View More
          </button>
        </div>

        <div ref={divRef} className="slider-div">
          {list}
        </div>
      </div>
    </>
  )
}
