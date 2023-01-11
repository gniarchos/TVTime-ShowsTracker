import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import "./ShowOverview.css"
import { nanoid } from "nanoid"
import { Icon } from "@iconify/react"
import YouTube from "react-youtube"
import Footer from "./Footer"
import noImg from "../images/no-image.png"
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../authentication/AuthContext"
import Episodes from "./Episodes"

export default function ShowOverview() {
  const location = useLocation()
  const isLoggedIn = true
  const show = location.state.data

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  document.title = `TVTime | ${show.name}`

  const [seasonNumber, setSeasonNumber] = React.useState("1")
  const [seasonDetails, setSeasonDetails] = React.useState([])
  const [finished, setFinished] = React.useState(false)
  const [showDaysUntil, setShowDaysUntil] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const navigate = useNavigate()
  const [toggleFullCast, setToggleFullCast] = React.useState(false)
  const { currentUser } = useAuth()
  const [isShowAddedInWatchList, setIsShowAddedInWatchList] =
    React.useState(false)
  const [showUserStatus, setShowUserStatus] = React.useState([""])
  const divCast = React.useRef()

  const [imdbRating, setImdbRating] = React.useState("0.0")
  const [rottenTomatoesRating, setRottenTomatoesRating] = React.useState("0%")
  const [theMovieDbRating, setTheMovieDbRating] = React.useState("0.0")

  React.useEffect(() => {
    setIsShowAddedInWatchList(false)
    db.collection(`watchlist-${location.state.userId}`)
      .where("show_name", "==", show.name)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          setIsShowAddedInWatchList(true)
        }
      })

    db.collection(`watchlist-${location.state.userId}`)
      .where("show_name", "==", show.name)
      .onSnapshot((snapshot) => {
        setShowUserStatus(
          snapshot.docs.map((doc) => ({
            status: doc.data().status,
          }))
        )
      })
  }, [show, isShowAddedInWatchList])

  const seasonEpisodesStyle = {
    flexDirection: scrolled && "column",
  }

  const fixedSeasonsStyle = {
    position: scrolled && "fixed",
    top: scrolled && "73px",
    width: scrolled && "71.5vw",

    backgroundColor: scrolled && "black",
    borderRadius: scrolled && "10px",
  }

  React.useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/tv/${show.id}/season/${seasonNumber}?api_key=47b60aaf43a6f85780c217395976aee5&language=en-US`
    )
      .then((res) => res.json())
      .then((data) => {
        setSeasonDetails(data)
      })
      .then(() => {
        setFinished(true)
      })

    fetch(
      `https://imdb-api.com/API/Ratings/k_kbidoyl5/${show.external_ids.imdb_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setImdbRating(data.imDb)
        setRottenTomatoesRating(data.rottenTomatoes)
        setTheMovieDbRating(data.theMovieDb)
      })
  }, [seasonNumber, show])

  // console.log(show.external_ids.imdb_id, imdbRating)

  const divImgStyle = {
    backgroundImage: `url('https://image.tmdb.org/t/p/original/${show.backdrop_path}')`,
  }

  // DATES CONVERTED
  const last_date_fix =
    show.last_episode_to_air && show.last_episode_to_air.air_date.split("-")
  const lastDate =
    last_date_fix !== null
      ? `${last_date_fix[2]}-${last_date_fix[1]}-${last_date_fix[0]}`
      : "-"
  const next_date_fix =
    show.next_episode_to_air !== null &&
    show.next_episode_to_air.air_date.split("-")
  const nextDate =
    show.next_episode_to_air === null &&
    (show.status === "Canceled" || show.status === "Ended")
      ? "Ended Series"
      : show.next_episode_to_air === null
      ? "TBA"
      : `${next_date_fix[2]}-${next_date_fix[1]}-${next_date_fix[0]}`

  let date_1 = new Date(
    `${next_date_fix[1]}/${next_date_fix[2]}/${next_date_fix[0]}`
  )
  let today = new Date()

  let difference = date_1.getTime() - today.getTime()
  let TotalDaysUntilEpisode =
    show.status !== "Ended"
      ? nextDate === "TBA"
        ? "--"
        : show.status === "Canceled" || show.status === "Ended"
        ? "-"
        : Math.ceil(difference / (1000 * 3600 * 24))
      : "-"

  let trailerIndex = 0
  let foundTrailer = false

  show.videos.results.map((res, index) => {
    if (res.name.includes("Trailer")) {
      trailerIndex = index
      foundTrailer = true
    }
  })

  if (foundTrailer === false) {
    show.videos.results.map((res, index) => {
      if (res.name.includes("Teaser")) {
        trailerIndex = index
        foundTrailer = true
      }
    })
  }

  const opts = {
    height: "600px",
    width: "95%",
  }

  const divSeasonRef = React.useRef("")

  function changeSeason(event) {
    const { id } = event.target

    setSeasonNumber(parseInt(id) + 1)

    for (let i = 0; i < divSeasonRef.current.childNodes.length; i++) {
      divSeasonRef.current.childNodes[i].classList.remove("active")
    }

    divSeasonRef.current.childNodes[id].classList.add("active")
  }

  let seasons = []
  for (let i = 1; i <= show.number_of_seasons; i++) {
    seasons.push(
      <div
        id={i - 1}
        onClick={(e) => changeSeason(e)}
        className={i === 1 ? "season-div active" : "season-div"}
      >
        Season {i}
      </div>
    )
  }

  const logos_networks = show.networks.map((logo) => {
    return (
      <img
        className="logos-img"
        src={`https://image.tmdb.org/t/p/w500/${logo.logo_path}`}
        alt="logo-network"
      />
    )
  })

  const createdBy = show.created_by.map((create) => {
    return <p className="creator">{create.name}</p>
  })

  const yearStarted_fix =
    show.first_air_date !== null ? show.first_air_date.split("-") : "-"
  const yearStarted = yearStarted_fix !== "-" ? `${yearStarted_fix[0]}` : "-"

  const languages = show.languages.map((lang) => {
    return <p className="show-languages">{lang}</p>
  })

  const cast = show.aggregate_credits.cast.slice(0, 10).map((person) => {
    return (
      <div className="cast-id">
        {person.profile_path !== null ? (
          <img
            className="cast-img-profile"
            src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
            alt="logo-network"
          />
        ) : (
          <img className="cast-no-img-profile" src={noImg} />
        )}
        <div className="cast-info-div-profile">
          <h3 className="cast-name">{person.name}</h3>
          <p className="cast-subinfo">{person.roles[0].character}</p>
          <p className="cast-subinfo">
            {person.roles[0].episode_count > 1
              ? `${person.roles[0].episode_count} Episodes`
              : `${person.roles[0].episode_count} Episode`}
          </p>
        </div>
      </div>
    )
  })

  const fullCast = show.aggregate_credits.cast.map((person) => {
    return (
      <div className="cast-id-full">
        {person.profile_path !== null ? (
          <img
            className="cast-img"
            src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
            alt="logo-network"
          />
        ) : (
          <img className="cast-no-img" src={noImg} />
        )}
        <div className="cast-info-div">
          <h3 className="cast-name">{person.name}</h3>
          <p className="cast-subinfo">{person.roles[0].character}</p>
          <p className="cast-subinfo">
            {person.roles[0].episode_count > 1
              ? `${person.roles[0].episode_count} Episodes`
              : `${person.roles[0].episode_count} Episode`}
          </p>
        </div>
      </div>
    )
  })

  const fullCrew = show.aggregate_credits.crew.map((person) => {
    return (
      <div className="cast-id-full">
        {person.profile_path !== null ? (
          <img
            className="cast-img"
            src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
            alt="logo-network"
          />
        ) : (
          <img className="cast-no-img" src={noImg} />
        )}
        <div className="cast-info-div">
          <h3 className="cast-name">{person.name}</h3>
          <p className="cast-subinfo">{person.known_for_department}</p>
          <p className="cast-subinfo">{person.jobs[0].job}</p>
        </div>
      </div>
    )
  })

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

  const recommending = show.recommendations.results
    .slice(0, 10)
    .map((recommend) => {
      return (
        <div
          onClick={() => goToShow(recommend.id)}
          className="recomending-show"
        >
          <div className="img-recommend-container">
            {recommend.backdrop_path !== null ? (
              <img
                className="recommending-img"
                src={`https://image.tmdb.org/t/p/w500/${recommend.backdrop_path}`}
              />
            ) : (
              <img className="recommending-noImg" src={noImg} />
            )}
          </div>
          <h3 className="cast-name">{recommend.name}</h3>
        </div>
      )
    })

  function goToFacebook() {
    window.location.href = `https://www.facebook.com/watch/${show.external_ids.facebook_id}`
  }

  function goToInstagram() {
    window.location.href = `https://www.instagram.com/${show.external_ids.instagram_id}`
  }

  function goToTwitter() {
    window.location.href = `https://twitter.com/${show.external_ids.twitter_id}`
  }

  function goToImdb() {
    window.location.href = `https://www.imdb.com/title/${show.external_ids.imdb_id}/`
  }

  function swapVisualDays() {
    setShowDaysUntil(!showDaysUntil)
  }

  function addToWatchList() {
    setIsShowAddedInWatchList(true)
    addDoc(collection(db, `watchlist-${location.state.userId}`), {
      show_name: show.name,
      show_id: show.id,
      season_number: 1,
      episode_number: 0,
      status: "not_started",
    })
  }

  function removeToWatchList() {
    setIsShowAddedInWatchList(false)
    db.collection(`watchlist-${location.state.userId}`)
      .where("show_name", "==", show.name)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs[0].ref.delete()
      })
  }

  function showHideFullCast() {
    setToggleFullCast(!toggleFullCast)
    window.scrollTo(0, 0)
  }

  function stopWatchingShow() {
    db.collection(`watchlist-${location.state.userId}`)
      .where("show_name", "==", show.name)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            status: "stopped",
          })
        })
      })
  }

  function resumeWatchingShow() {
    db.collection(`watchlist-${location.state.userId}`)
      .where("show_name", "==", show.name)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            status: "watching",
          })
        })
      })
  }

  return (
    <div className="showOverview-wrapper">
      <div className="bg"></div>
      <Navbar isLoggedIn={isLoggedIn} />

      <div style={divImgStyle} className="div-show-img">
        <div className="show-main-title-details">
          <h4 className="show-status">
            {show.status === "In Production" ? "Upcoming" : show.status}
          </h4>

          <h1 className="show-title">{show.name}</h1>

          <div className="div-show-genres">
            {show.genres.map((gen, index) => (
              <p key={nanoid()} className="show-genres">
                {gen.name}
              </p>
            ))}
          </div>

          <div className="ratings-wrapper">
            <div className="div-ratings">
              <img
                className="webRating-img-imdb"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/1200px-IMDB_Logo_2016.svg.png"
                alt="IMDB Logo"
              />
              <p className="rating-num">
                {imdbRating === "" ? "0.0" : parseFloat(imdbRating).toFixed(1)}
                <Icon icon="eva:star-fill" color="#fed600" />
              </p>
            </div>

            <div className="div-ratings">
              <img
                className="webRating-img"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Rotten_Tomatoes.svg/1200px-Rotten_Tomatoes.svg.png"
                alt="Rotten Tomatoes"
              />
              <p className="rating-num">
                {rottenTomatoesRating === "" ? "0" : rottenTomatoesRating} %
              </p>
            </div>

            <div className="div-ratings">
              <img
                className="webRating-img-tmdb"
                src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Tmdb-312x276-logo.png"
                alt="Tmdb"
              />
              <p className="rating-num">
                {theMovieDbRating === ""
                  ? "0.0"
                  : parseFloat(theMovieDbRating).toFixed(1)}
                <Icon icon="eva:star-fill" color="#fed600" />
              </p>
            </div>
          </div>

          <div className="seasons-network-container">
            <h3 className="show-total-seasons">
              {show.number_of_seasons > 1
                ? `${show.number_of_seasons} Seasons`
                : `${show.number_of_seasons} Season`}
            </h3>
            <h3 className="show-total-seasons">&#8226;</h3>
            <h3 className="show-network">
              {show.networks.length > 0 ? show.networks[0].name : "Unknown"}
            </h3>
            <h3 className="show-total-seasons">&#8226;</h3>
            <div className="show-watchlist-buttons"></div>
            {!isShowAddedInWatchList ? (
              <p onClick={addToWatchList} className="watchlist-show">
                <Icon
                  className="whishlist-icon-add-remove-show"
                  icon="bi:bookmark-plus-fill"
                />
                Add to Watchlist
              </p>
            ) : (
              <p onClick={removeToWatchList} className="watchlist-show">
                <Icon
                  className="whishlist-icon-add-remove-show"
                  icon="bi:bookmark-star-fill"
                />
                Remove Show
              </p>
            )}
          </div>
          {isShowAddedInWatchList &&
            showUserStatus[0]?.status === "watching" && (
              <div className="seasons-network-container">
                <p onClick={stopWatchingShow} className="watchlist-show">
                  <Icon
                    className="whishlist-icon-add-remove-show"
                    icon="akar-icons:circle-x-fill"
                  />
                  Stop Watching
                </p>
              </div>
            )}

          {isShowAddedInWatchList && showUserStatus[0]?.status == "stopped" && (
            <div className="seasons-network-container">
              <p onClick={resumeWatchingShow} className="watchlist-show">
                <Icon
                  className="whishlist-icon-add-remove-show"
                  icon="akar-icons:circle-x-fill"
                />
                Resume Show
              </p>
            </div>
          )}
        </div>
      </div>

      {!toggleFullCast && (
        <div className="show-info-container">
          <div className="top-info-div">
            <div className="info-div">
              <h1>Where to watch</h1>
              <a className="whereToWatch-link" href={show.homepage}>
                <Icon icon="ci:play-circle-outline" />
                Official Site
              </a>
            </div>

            {lastDate !== "-" && (
              <div className="info-div">
                <h1>Latest Episode</h1>
                <p className="episodes-dates lastDate">{lastDate}</p>
              </div>
            )}

            <div className="info-div">
              <h1>{lastDate === "-" ? "Premiere" : "Next Episode"}</h1>
              <p onClick={swapVisualDays} className="episodes-dates">
                {showDaysUntil
                  ? TotalDaysUntilEpisode === "-"
                    ? "Ended Series"
                    : TotalDaysUntilEpisode !== 1
                    ? `${TotalDaysUntilEpisode} Days`
                    : `${TotalDaysUntilEpisode} Day`
                  : nextDate}{" "}
              </p>
            </div>
          </div>
        </div>
      )}

      {!toggleFullCast && (
        <div className="show-main-container">
          <div className="all-data-div">
            <div className="synopsis-div">
              {show.overview !== "" && <h1>Synopsis</h1>}
              {show.overview !== "" && (
                <p className="synopsis-text">{show.overview}</p>
              )}

              {show.videos.results.length > 0 && (
                <YouTube
                  containerClassName={"youtube-container amru"}
                  videoId={`${show.videos.results[trailerIndex].key}`}
                  id={`${show.videos.results[trailerIndex].id}`}
                  opts={opts}
                  className="youtube-trailer"
                />
              )}
            </div>

            <div>
              <h1>Seasons & Episodes</h1>

              <div
                style={seasonEpisodesStyle}
                className="seasons-episodes-wrapper"
              >
                <div
                  style={fixedSeasonsStyle}
                  ref={divSeasonRef}
                  className="seasons-container"
                >
                  {seasons}
                </div>

                <div className="season-episodes-container">
                  {finished &&
                    seasonDetails.episodes.map((episode, index) => {
                      let air_date_fix =
                        episode.air_date_fix !== null &&
                        episode.air_date.split("-")
                      let new_air_date = new Date(
                        `${air_date_fix[1]}/${air_date_fix[2]}/${air_date_fix[0]}`
                      )

                      let difference_ep =
                        new_air_date.getTime() - today.getTime()
                      let daysUntilCurrentEpisode = Math.ceil(
                        difference_ep / (1000 * 3600 * 24)
                      )

                      return (
                        <Episodes
                          episodeNum={index + 1}
                          seasonNum={seasonNumber}
                          episode={episode}
                          episodeName={episode.name}
                          daysUntilCurrentEpisode={daysUntilCurrentEpisode}
                          today={today}
                          new_air_date={new_air_date}
                          currentUserID={location.state.userId}
                          showName={show.name}
                          showID={show.id}
                          current_season_episodes_count={
                            seasonDetails.episodes.length
                          }
                        />
                      )
                    })}
                </div>
              </div>
            </div>

            <div ref={divCast} className="cast-wrapper">
              <h1>Series Cast</h1>
              <div className="cast-div">
                {cast}
                <div className="test">
                  <button onClick={showHideFullCast} className="all-cast-btn">
                    Full List
                    <Icon icon="codicon:arrow-small-right" width={40} />
                  </button>
                </div>
              </div>
            </div>

            {recommending.length > 0 && (
              <div className="recommend-wrapper">
                <h1>Recommending Shows</h1>
                <div className="recommend-container">{recommending}</div>
              </div>
            )}
          </div>

          <div className="all-details-div">
            <div className="show-social">
              {show.external_ids.facebook_id !== null && (
                <Icon
                  onClick={goToFacebook}
                  className="social-img facebook"
                  icon="akar-icons:facebook-fill"
                  width={30}
                />
              )}
              {show.external_ids.instagram_id !== null && (
                <Icon
                  onClick={goToInstagram}
                  className="social-img instagram"
                  icon="akar-icons:instagram-fill"
                  width={30}
                />
              )}
              {show.external_ids.twitter_id !== null && (
                <Icon
                  onClick={goToTwitter}
                  className="social-img twitter"
                  icon="akar-icons:twitter-fill"
                  width={30}
                />
              )}
              {show.external_ids.imdb_id !== null && (
                <Icon
                  onClick={goToImdb}
                  className="social-img imdb"
                  icon="cib:imdb"
                  width={30}
                />
              )}
            </div>

            <div className="networks-container">
              <h3 className="details-title">
                {show.networks.length > 1 ? "Networks" : "Network"}
              </h3>
              <div className="logos-networks-div">{logos_networks}</div>
            </div>

            <div>
              <h3 className="details-title">
                {show.created_by.length > 1 ? "Creators" : "Creator"}
              </h3>
              {createdBy}
            </div>

            <div>
              <h3 className="details-title">Year</h3>
              {yearStarted}
            </div>

            <div>
              <h3 className="details-title">
                {show.languages.length > 1 ? "Languages" : "Language"}
              </h3>
              <div className="languages-div">{languages}</div>
            </div>

            <div>
              <h3 className="details-title">Episodes Runtime</h3>
              <p className="creator">
                {show.episode_run_time.length > 0
                  ? `${show.episode_run_time}'`
                  : "-"}
              </p>
            </div>

            <div>
              <h3 className="details-title">Number of Episodes</h3>
              <p className="creator">{show.number_of_episodes}</p>
            </div>

            <div>
              <h3 className="details-title">Type</h3>
              <p className="creator">{show.type}</p>
            </div>
          </div>
        </div>
      )}

      {toggleFullCast && (
        <div className="fullCast-container">
          <button onClick={showHideFullCast} className="backShow-btn">
            <Icon icon="bi:arrow-left" />
            Back to Show
          </button>
          <div className="cast-crew-wrapper">
            <div className="fullCast-div">
              <h1>Full Cast</h1>
              {fullCast}
            </div>
            <div className="fullCrew-div">
              <h1>Full Crew</h1>
              {fullCrew}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
