import React from "react"
import Navbar from "./Navbar"
import "./Profile.css"
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useLocation } from "react-router-dom"
import { useAuth } from "../authentication/AuthContext"
import noWatched_img from "../images/notWatched.png"
import def_cover from "../images/def-cover.jpg"
import EpisodesProfile from "./EpisodesProfile"
import { nanoid } from "nanoid"
import Footer from "./Footer"
import PuffLoader from "react-spinners/PuffLoader"
import HistoryEpisodes from "./HistoryEpisodes"
import { Icon } from "@iconify/react"

export default function Profile() {
  document.title = `TVTime | TV Shows Tracker`

  const [showsData, setShowsData] = React.useState([])
  const [myShows, setMyShows] = React.useState([])
  const [seasonData, setSeasonData] = React.useState([])
  const [finished, setFinished] = React.useState(false)
  const location = useLocation()
  const { currentUser } = useAuth()
  const [showsImages, setShowsImages] = React.useState([])
  const [trackedShows, setTrackedShows] = React.useState()
  const [watchingShows, setWatchingShows] = React.useState()
  const [hasFinishedShows, setHasFinishedShows] = React.useState()
  const [notStartedYetShows, setNotStartedYetShows] = React.useState()
  const [readLocalStorage, setReadLocalStorage] = React.useState(false)
  const [resetSeason, setResetSeason] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [isFirstLoad, setIsFirstLoad] = React.useState(true)
  const [historyData, setHistoryData] = React.useState([])
  const [userWatchingTime, setUserWatchingTime] = React.useState(0)
  const [userWatchedEpisodes, setUserWatchedEpisodes] = React.useState(0)
  const [isSelectCoverOpen, setIsSelectCoverOpen] = React.useState(false)
  const [userCoverSettings, setUserCoverSettings] = React.useState()
  const [selectedCoverImage, setSelectedCoverImage] =
    React.useState(userCoverSettings)

  const [watchNextSection, setWatchNextSection] = React.useState(
    localStorage.getItem("watchNextSection")
      ? JSON.parse(localStorage.getItem("watchNextSection"))
      : true
  )
  const [upToDateSection, setUpToDateSection] = React.useState(
    localStorage.getItem("upToDateSection")
      ? JSON.parse(localStorage.getItem("upToDateSection"))
      : true
  )
  const [watchlistSection, setWatchlistSection] = React.useState(
    localStorage.getItem("watchlistSection")
      ? JSON.parse(localStorage.getItem("watchlistSection"))
      : true
  )
  const [finishedSection, setFinishedSection] = React.useState(
    localStorage.getItem("finishedSection")
      ? JSON.parse(localStorage.getItem("finishedSection"))
      : true
  )
  const [historySection, setHistorySection] = React.useState(
    localStorage.getItem("historySection")
      ? JSON.parse(localStorage.getItem("historySection"))
      : true
    // false
  )
  const [upToDateSettings, setUpToDateSettings] = React.useState(false)
  const [upToDateFilter, setUpToDateFilter] = React.useState(
    localStorage.getItem("upToDateFilter")
      ? localStorage.getItem("upToDateFilter")
      : "soon"
  )

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  React.useEffect(() => {
    setLoading(true)

    db.collection(`watchlist-${currentUser.uid}`).onSnapshot((snapshot) => {
      setMyShows(
        snapshot.docs.map((doc) => ({
          show_id: doc.data().show_id,
          show_name: doc.data().show_name,
          seasonNumber: doc.data().season_number,
          episodeNumber: doc.data().episode_number,
          status: doc.data().status,
        }))
      )

      setFinished(!finished)
    })

    if (userCoverSettings === "default") {
      setSelectedCoverImage(def_cover)
    } else {
      setSelectedCoverImage(userCoverSettings)
    }
  }, [])

  React.useEffect(() => {
    if (userCoverSettings === "default") {
      setSelectedCoverImage(def_cover)
    } else {
      setSelectedCoverImage(userCoverSettings)
    }
  }, [userCoverSettings])

  React.useEffect(() => {
    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((snapshot) =>
        setUserCoverSettings(snapshot.data().profile_cover_selection)
      )

    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((snapshot) => setUserWatchingTime(snapshot.data().watching_time))

    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((snapshot) =>
        setUserWatchedEpisodes(snapshot.data().total_episodes)
      )

    db.collection(`watchlist-${currentUser.uid}`)
      .get()
      .then((snap) => {
        setTrackedShows(snap.size) // will return the collection size
      })

    db.collection(`watchlist-${currentUser.uid}`)
      .where("status", "==", "watching")
      .get()
      .then((snap) => {
        setWatchingShows(snap.size) // will return the collection size
      })

    db.collection(`watchlist-${currentUser.uid}`)
      .where("status", "==", "finished")
      .get()
      .then((snap) => {
        setHasFinishedShows(snap.size) // will return the collection size
      })

    db.collection(`watchlist-${currentUser.uid}`)
      .where("status", "==", "not_started")
      .get()
      .then((snap) => {
        setNotStartedYetShows(snap.size) // will return the collection size
      })

    db.collection(`history-${currentUser.uid}`)
      .orderBy("date_watched", "desc")
      .limit(50)
      .onSnapshot((snapshot) => {
        setHistoryData(
          snapshot.docs.map((doc) => ({
            show_name: doc.data().show_name,
            show_id: doc.data().show_id,
            season_number: doc.data().season_number,
            episode_number: doc.data().episode_number,
            date_watched: doc.data().date_watched,
            episode_name: doc.data().episode_name,
            show_cover: doc.data().show_cover,
          }))
        )
      })

    myShows.map((myShow, index) => {
      fetch(
        `https://api.themoviedb.org/3/tv/${myShow.show_id}?api_key=47b60aaf43a6f85780c217395976aee5&language=en-US&include_image_language=en,null&append_to_response=external_ids,videos,aggregate_credits,content_ratings,recommendations,similar,watch/providers,images`
      )
        .then((res) => res.json())
        .then((data) => {
          setShowsData((prevData) => {
            return [...prevData, data]
          })

          setShowsImages((prevImages) => {
            return [...prevImages, data.images.backdrops]
          })
        })
        .then(() => {
          fetch(
            `https://api.themoviedb.org/3/tv/${myShow.show_id}/season/${myShow.seasonNumber}?api_key=47b60aaf43a6f85780c217395976aee5&language=en-US`
          )
            .then((res) => res.json())
            .then((data) => {
              data.show_id = myShow.show_id
              setSeasonData((prevData) => {
                return [...prevData, data]
              })
            })
        })
    })

    //

    setLoading(false)
  }, [finished])

  localStorage.setItem("total_episodes", userWatchedEpisodes)
  localStorage.setItem("watching_time", userWatchingTime)

  React.useEffect(() => {
    if (!isFirstLoad) {
      window.location.reload()
    } else {
      setIsFirstLoad(false)
    }
  }, [resetSeason === true])

  const watchNextShows = myShows
    .filter((show) => show.status === "watching")
    .map((show, showIndex) => {
      let show_date = new Date(
        seasonData
          .filter((season) => season.show_id === show.show_id)
          .map((season) => {
            return (
              (season?.episodes !== undefined ||
                season?.episodes?.length > 0) &&
              season?.episodes[show.episodeNumber]?.air_date
            )
          })
      )

      let today = new Date()
      let difference = show_date.getTime() - today.getTime()
      let daysUntilCurrentEpisode = Math.ceil(difference / (1000 * 3600 * 24))

      if (
        daysUntilCurrentEpisode <= 0 &&
        isNaN(daysUntilCurrentEpisode) === false
      ) {
        return (
          <EpisodesProfile
            backdrop_path={showsData
              .filter((allData) => allData.name === show.show_name)
              .map((allData) => {
                return allData.backdrop_path
              })}
            showName={show.show_name}
            episode_name={seasonData
              .filter((season) => season.show_id === show.show_id)
              ?.map((season) => {
                return season.episodes[show.episodeNumber].name
              })}
            currentUserID={currentUser.uid}
            episode_number={show.episodeNumber}
            season_number={show.seasonNumber}
            today={today}
            difference={difference}
            daysUntilCurrentEpisode={daysUntilCurrentEpisode}
            show_all_seasons={showsData
              .filter((allData) => allData.name === show.show_name)
              .map((allData) => {
                return allData.number_of_seasons
              })}
            curr_season_episodes={seasonData
              .filter((season) => season.show_id === show.show_id)
              .map((season) => {
                return season.episodes.length
              })}
            showID={show.show_id}
            episode_time={seasonData
              .filter((season) => season.show_id === show.show_id)
              ?.map((season) => {
                return season.episodes[show.episodeNumber].runtime !== null
                  ? season.episodes[show.episodeNumber].runtime
                  : 0
              })}
            triggerLoadDataLocalStorage={triggerLoadDataLocalStorage}
            resetSeasonData={resetSeasonData}
            show_status={showsData
              .filter((allData) => allData.name === show.show_name)
              .map((allData) => {
                return allData.status
              })
              .join("")}
          />
        )
      }
    })

  const upToDateShows = myShows
    .filter((show) => show.status === "watching")
    .map((show, showIndex) => {
      let show_date = new Date(
        seasonData
          .filter((season) => season.show_id === show.show_id)
          .map((season) => {
            return (
              (season?.episodes !== undefined ||
                season?.episodes?.length > 0) &&
              season?.episodes[show.episodeNumber]?.air_date
            )
          })
      )

      let today = new Date()
      let difference = show_date.getTime() - today.getTime()
      let daysUntilCurrentEpisode = Math.ceil(difference / (1000 * 3600 * 24))

      const nextEpisodeDate_data = showsData
        .filter((allData) => allData.name === show.show_name)
        .map((allData) => {
          let air_date_fix = allData.next_episode_to_air?.air_date.split("-")
          let new_air_date =
            air_date_fix !== undefined &&
            `${air_date_fix[2]}/${air_date_fix[1]}/${air_date_fix[0]}`

          return new_air_date
        })

      if (
        daysUntilCurrentEpisode > 0 ||
        isNaN(daysUntilCurrentEpisode) === true
      ) {
        if (upToDateFilter === "all") {
          return (
            <EpisodesProfile
              backdrop_path={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.backdrop_path
                })}
              showName={show.show_name}
              episode_name={seasonData
                .filter((season) => season.show_id === show.show_id)
                .map((season) => {
                  return (
                    (season?.episodes !== undefined ||
                      season?.episodes?.length > 0) &&
                    season?.episodes[show.episodeNumber]?.name
                  )
                })
                .join("")}
              currentUserID={currentUser.uid}
              episode_number={show.episodeNumber}
              season_number={show.seasonNumber}
              today={today}
              difference={difference}
              daysUntilCurrentEpisode={daysUntilCurrentEpisode}
              show_all_seasons={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.number_of_seasons
                })}
              curr_season_episodes={seasonData
                .filter((season) => season.show_id === show.show_id)
                .map((season) => {
                  return season.episodes !== undefined && season.episodes.length
                })}
              showID={show.show_id}
              nextEpisodeDate={nextEpisodeDate_data}
              triggerLoadDataLocalStorage={triggerLoadDataLocalStorage}
              resetSeasonData={resetSeasonData}
              upToDate={true}
              show_status={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.status
                })
                .join("")}
              filter={upToDateFilter}
            />
          )
        } else if (
          upToDateFilter === "soon" &&
          parseInt(nextEpisodeDate_data) >= 0
        ) {
          return (
            <EpisodesProfile
              backdrop_path={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.backdrop_path
                })}
              showName={show.show_name}
              episode_name={seasonData
                .filter((season) => season.show_id === show.show_id)
                .map((season) => {
                  return (
                    (season?.episodes !== undefined ||
                      season?.episodes?.length > 0) &&
                    season?.episodes[show.episodeNumber]?.name
                  )
                })
                .join("")}
              currentUserID={currentUser.uid}
              episode_number={show.episodeNumber}
              season_number={show.seasonNumber}
              today={today}
              difference={difference}
              daysUntilCurrentEpisode={daysUntilCurrentEpisode}
              show_all_seasons={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.number_of_seasons
                })}
              curr_season_episodes={seasonData
                .filter((season) => season.show_id === show.show_id)
                .map((season) => {
                  return season.episodes !== undefined && season.episodes.length
                })}
              showID={show.show_id}
              nextEpisodeDate={nextEpisodeDate_data}
              triggerLoadDataLocalStorage={triggerLoadDataLocalStorage}
              resetSeasonData={resetSeasonData}
              upToDate={true}
              show_status={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.status
                })
                .join("")}
              filter={upToDateFilter}
            />
          )
        } else if (
          upToDateFilter === "returning" &&
          JSON.stringify(nextEpisodeDate_data) === "[false]"
        ) {
          return (
            <EpisodesProfile
              backdrop_path={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.backdrop_path
                })}
              showName={show.show_name}
              episode_name={seasonData
                .filter((season) => season.show_id === show.show_id)
                .map((season) => {
                  return (
                    (season?.episodes !== undefined ||
                      season?.episodes?.length > 0) &&
                    season?.episodes[show.episodeNumber]?.name
                  )
                })
                .join("")}
              currentUserID={currentUser.uid}
              episode_number={show.episodeNumber}
              season_number={show.seasonNumber}
              today={today}
              difference={difference}
              daysUntilCurrentEpisode={daysUntilCurrentEpisode}
              show_all_seasons={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.number_of_seasons
                })}
              curr_season_episodes={seasonData
                .filter((season) => season.show_id === show.show_id)
                .map((season) => {
                  return season.episodes !== undefined && season.episodes.length
                })}
              showID={show.show_id}
              nextEpisodeDate={nextEpisodeDate_data}
              triggerLoadDataLocalStorage={triggerLoadDataLocalStorage}
              resetSeasonData={resetSeasonData}
              upToDate={true}
              show_status={showsData
                .filter((allData) => allData.name === show.show_name)
                .map((allData) => {
                  return allData.status
                })
                .join("")}
              filter={upToDateFilter}
            />
          )
        }
      }
    })

  // console.log(seasonData)

  const notStartedShows = myShows
    .filter((show) => show.status === "not_started")
    .map((show, showIndex) => {
      let show_date = new Date(
        seasonData
          .filter((season) => season.show_id === show.show_id)
          .map((season) => {
            return (
              season.episodes !== undefined &&
              season?.episodes[show?.episodeNumber]?.air_date
            )
          })
      )

      let today = new Date()
      let difference = show_date.getTime() - today.getTime()
      let daysUntilCurrentEpisode = Math.ceil(difference / (1000 * 3600 * 24))

      return (
        <EpisodesProfile
          backdrop_path={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              return allData.backdrop_path
            })}
          showName={show.show_name}
          episode_name={seasonData
            .filter((season) => season.show_id === show.show_id)
            .map((season) => {
              return (
                season.episodes !== undefined &&
                season.episodes[show.episodeNumber].name
              )
            })}
          currentUserID={currentUser.uid}
          episode_number={show.episodeNumber}
          season_number={show.seasonNumber}
          today={today}
          difference={difference}
          daysUntilCurrentEpisode={daysUntilCurrentEpisode}
          show_all_seasons={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              return allData.number_of_seasons
            })}
          curr_season_episodes={seasonData
            .filter((season) => season.show_id === show.show_id)
            .map((season) => {
              return season.episodes !== undefined && season.episodes.length
            })}
          showID={show.show_id}
          episode_time={seasonData
            .filter((season) => season.show_id === show.show_id)
            ?.map((season) => {
              if (season.episodes !== undefined) {
                return season.episodes[show.episodeNumber].runtime !== null
                  ? season.episodes[show.episodeNumber].runtime
                  : 0
              }
            })}
          triggerLoadDataLocalStorage={triggerLoadDataLocalStorage}
          resetSeasonData={resetSeasonData}
          is_premiering={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              return allData.last_air_date === null ? true : false
            })
            .join("")}
          is_notStarted={true}
          nextEpisodeDate={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              let air_date_fix =
                allData.next_episode_to_air?.air_date.split("-")
              let new_air_date =
                air_date_fix !== undefined &&
                `${air_date_fix[2]}/${air_date_fix[1]}/${air_date_fix[0]}`

              return new_air_date
            })}
        />
      )
    })

  const finishedShows = myShows
    .filter((show) => show.status === "finished")
    .map((show, showIndex) => {
      return (
        <EpisodesProfile
          backdrop_path={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              return allData.backdrop_path
            })}
          showName={show.show_name}
          currentUserID={currentUser.uid}
          episode_number={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              return allData.number_of_episodes
            })}
          season_number={showsData
            .filter((allData) => allData.name === show.show_name)
            .map((allData) => {
              return allData.number_of_seasons
            })}
          today={0}
          difference={0}
          daysUntilCurrentEpisode={0}
          finishedShow={true}
          showID={show.show_id}
          triggerLoadDataLocalStorage={triggerLoadDataLocalStorage}
          resetSeasonData={resetSeasonData}
        />
      )
    })

  const watchedHistory = historyData.map((history) => {
    return (
      <HistoryEpisodes
        history_show_name={history.show_name}
        history_show_id={history.show_id}
        history_season_number={history.season_number}
        history_episode_number={history.episode_number}
        history_date_watched={history.episode_number}
        history_episode_name={history.episode_name}
        history_cover={history.show_cover}
        currentUserID={currentUser.uid}
        resetSeasonData={resetSeasonData}
      />
    )
  })

  function triggerLoadDataLocalStorage() {
    setReadLocalStorage(!readLocalStorage)
  }

  function resetSeasonData(id) {
    setResetSeason(!resetSeason)
  }

  function toggleUpToDateSettings() {
    setUpToDateSettings(!upToDateSettings)
  }

  function toggleSections(event) {
    const { id } = event.target
    console.log("EVENT ID:", id)

    if (id === "watchNext") {
      setWatchNextSection(!watchNextSection)
      localStorage.setItem("watchNextSection", !watchNextSection)
    } else if (id === "upToDate") {
      setUpToDateSection(!upToDateSection)
      localStorage.setItem("upToDateSection", !upToDateSection)
    } else if (id === "watchlist") {
      setWatchlistSection(!watchlistSection)
      localStorage.setItem("watchlistSection", !watchlistSection)
    } else if (id === "finished") {
      setFinishedSection(!finishedSection)
      localStorage.setItem("finishedSection", !finishedSection)
    } else if (id === "history") {
      setHistorySection(!historySection)
      localStorage.setItem("historySection", !historySection)
    }
  }

  function handleFilterUpToDate(event) {
    const { id } = event.target

    if (id === "all") {
      setUpToDateFilter("all")
      localStorage.setItem("upToDateFilter", "all")
    } else if (id === "soon") {
      setUpToDateFilter("soon")
      localStorage.setItem("upToDateFilter", "soon")
    } else if (id === "returning") {
      setUpToDateFilter("returning")
      localStorage.setItem("upToDateFilter", "returning")
    }
  }

  const [userTime, setUserTime] = React.useState(
    localStorage.getItem("watching_time")
      ? localStorage.getItem("watching_time")
      : userWatchingTime
  )

  const [userEpisodes, setUserEpisodes] = React.useState(
    localStorage.getItem("total_episodes")
      ? localStorage.getItem("total_episodes")
      : userWatchedEpisodes
  )

  const [watchingStatistic, setWatchingStatistic] = React.useState([])
  React.useEffect(() => {
    setLoading(true)

    setUserTime(
      localStorage.getItem("watching_time")
        ? localStorage.getItem("watching_time")
        : userWatchingTime
    )

    setUserEpisodes(
      localStorage.getItem("total_episodes")
        ? localStorage.getItem("total_episodes")
        : userWatchedEpisodes
    )

    // const MINS_PER_MONTH = 24 * 30 * 60
    // const MINS_PER_DAY = 24 * 60

    // let minutes = userTime
    // const days = Math.floor(minutes / MINS_PER_DAY)
    // const hours = Math.floor((minutes - days * 1440) / 60)
    // const months = Math.floor(minutes / MINS_PER_MONTH)
    // minutes = minutes - months * MINS_PER_MONTH
    let minutes = userTime
    const months = Math.floor(minutes / (30 * 24 * 60))

    const days = Math.floor((minutes % (30 * 24 * 60)) / (24 * 60))

    const hours = Math.floor((minutes % (24 * 60)) / 60)

    setWatchingStatistic([months, days, hours])

    setTimeout(function () {
      setLoading(false)
    }, 900)
  }, [readLocalStorage, userWatchingTime, userTime])

  function temporarySaveCoverSelection(image) {
    const fixed_image = image.replace("w500", "original")
    localStorage.setItem("cover_temp_selection", fixed_image)
  }

  function confirmCoverImage() {
    db.collection("users")
      .doc(currentUser.uid)
      .update({
        profile_cover_selection: localStorage.getItem("cover_temp_selection"),
      })

    setTimeout(function () {
      setSelectedCoverImage(localStorage.getItem("cover_temp_selection"))
      setIsSelectCoverOpen(!isSelectCoverOpen)
    }, 500)
  }

  function handleCoverSelector() {
    setIsSelectCoverOpen(!isSelectCoverOpen)
  }

  return (
    <div>
      <div className="bg"></div>
      <Navbar isLoggedIn={true} isProfile={true} />

      <div className="profile-cover-div">
        <img
          className="profile-cover"
          src={selectedCoverImage}
          alt="episode-card-img"
        />

        <button
          onClick={handleCoverSelector}
          type="button"
          className="btn-change-cover"
        >
          <Icon icon="ant-design:camera-filled" />
          Edit Cover
        </button>

        <div className="user-details-container">
          <div className="details-account">
            <div className="section-1">
              <div className="statistic-numbers">
                <h3 className="stat-title">Shows </h3>
                <p className="stat-num">{trackedShows}</p>
              </div>

              <div className="statistic-numbers">
                <h3 className="stat-title">Watching </h3>
                <p className="stat-num">{watchingShows}</p>
              </div>
            </div>

            <div className="section-2">
              <div className="statistic-numbers">
                <h3 className="stat-title">Not Started </h3>
                <p className="stat-num">{notStartedYetShows}</p>
              </div>

              <div className="statistic-numbers">
                <h3 className="stat-title">Finished </h3>
                <p className="stat-num">{hasFinishedShows}</p>
              </div>
            </div>
          </div>

          <div className="user-div-container">
            <img
              className="user-img"
              src="https://media.giphy.com/media/idwAvpAQKlX7ARsoWC/giphy.gif"
            />
          </div>
        </div>
      </div>

      <div className="statistics-info-container">
        <div className="top-info-div-profile">
          <div className="info-div-profile">
            <h1 className="stats-title">TV Time</h1>
            <div className="tvtime-container">
              <div className="tvtime-stats">
                <p className="stats-number">{watchingStatistic[0]}</p>
                <p className="stats-subtitle">
                  {watchingStatistic[0] === 1 ? "MONTH" : "MONTHS"}
                </p>
              </div>
              <div className="tvtime-stats">
                <p className="stats-number">{watchingStatistic[1]}</p>
                <p className="stats-subtitle">
                  {watchingStatistic[1] === 1 ? "DAY" : "DAYS"}
                </p>
              </div>
              <div className="tvtime-stats">
                <p className="stats-number">{watchingStatistic[2]}</p>
                <p className="stats-subtitle">
                  {watchingStatistic[2] === 1 ? "HOUR" : "HOURS"}
                </p>
              </div>
            </div>
          </div>

          <div className="info-div-profile">
            <h1 className="stats-title">Episodes Watched</h1>
            <p className="stats-number">{userEpisodes}</p>
          </div>
        </div>
      </div>

      {loading === true && (
        <div className="spinner-div">
          <PuffLoader color={"white"} size={100} />
          <h3>Reloading Data...</h3>
        </div>
      )}

      {loading === false && (
        <div>
          <div className="profile-wrapper">
            {watchNextShows.length > 0 && (
              <div className="title-button">
                <h1 className="profile-section-title">Watch Next</h1>
                <button
                  id="watchNext"
                  className="viewMore-button"
                  onClick={(e) => toggleSections(e)}
                >
                  {watchNextSection ? "Hide" : "Show"}
                </button>
              </div>
            )}
            {watchNextShows.length > 0 && watchNextSection && (
              <>
                <div className="details-container">{watchNextShows}</div>
                <div className="divider line glow"></div>
              </>
            )}

            {upToDateShows.length > 0 && (
              <div className="title-button">
                <h1 className="profile-section-title uptodate-settings">
                  Up to Date
                  <Icon
                    className="setting-icon"
                    icon="akar-icons:settings-horizontal"
                    onClick={toggleUpToDateSettings}
                  />
                </h1>
                <button
                  id="upToDate"
                  className="viewMore-button"
                  onClick={(e) => toggleSections(e)}
                >
                  {upToDateSection ? "Hide" : "Show"}
                </button>
              </div>
            )}

            {upToDateSettings && (
              <div className="upToDate-filters">
                <h4
                  className={
                    upToDateFilter === "all"
                      ? "filter-title active"
                      : "filter-title"
                  }
                  id="all"
                  onClick={(e) => handleFilterUpToDate(e)}
                >
                  All
                </h4>
                <h4
                  className={
                    upToDateFilter === "soon"
                      ? "filter-title active"
                      : "filter-title"
                  }
                  id="soon"
                  onClick={(e) => handleFilterUpToDate(e)}
                >
                  Coming Soon
                </h4>
                <h4
                  className={
                    upToDateFilter === "returning"
                      ? "filter-title active"
                      : "filter-title"
                  }
                  id="returning"
                  onClick={(e) => handleFilterUpToDate(e)}
                >
                  Returning
                </h4>
              </div>
            )}

            {upToDateShows.length > 0 && upToDateSection && (
              <>
                <div className="details-container">{upToDateShows}</div>
                <div className="divider line glow"></div>
              </>
            )}

            <div className="title-button">
              <h1 className="profile-section-title">Your Watchlist</h1>
              <button
                id="watchlist"
                className="viewMore-button"
                onClick={(e) => toggleSections(e)}
              >
                {watchlistSection ? "Hide" : "Show"}
              </button>
            </div>
            {notStartedShows.length > 0 && watchlistSection && (
              <>
                <div className="details-container">{notStartedShows}</div>
                <div className="divider line glow"></div>
              </>
            )}

            {notStartedShows.length <= 0 && (
              <div className="noShows-div">
                <p className="noShows-text">
                  &#10148; Shows you want to track will appear here.
                </p>
              </div>
            )}

            {finishedShows.length > 0 && (
              <div className="title-button">
                <h1 className="profile-section-title">Finished</h1>
                <button
                  id="finished"
                  className="viewMore-button"
                  onClick={(e) => toggleSections(e)}
                >
                  {finishedSection ? "Hide" : "Show"}
                </button>
              </div>
            )}
            {finishedShows.length > 0 && finishedSection && (
              <>
                <div className="details-container">{finishedShows}</div>
                <div className="divider line glow"></div>
              </>
            )}

            {watchedHistory.length > 0 && (
              <div className="title-button">
                <h1 className="profile-section-title">
                  History <Icon icon="clarity:beta-solid" />
                </h1>
                <button
                  id="history"
                  className="viewMore-button"
                  onClick={(e) => toggleSections(e)}
                >
                  {historySection ? "Hide" : "Show"}
                </button>
              </div>
            )}

            {historySection && watchedHistory.length > 0 && (
              <div className="details-container history-container">
                {watchedHistory}
              </div>
            )}
          </div>
        </div>
      )}

      {isSelectCoverOpen === true && (
        <div className="coverSelection-container">
          <div className="coverImg-selection-div">
            <h2 className="h2-selection">Choose your cover image:</h2>
            <div className="cover-images-div">
              <img
                className="cover-img-preview"
                src={def_cover}
                alt="shows-images"
                onClick={() => temporarySaveCoverSelection(`${def_cover}`)}
              />
              {showsImages.map((img) => {
                return img
                  .filter((img) => img.height >= 720)
                  .map((image) => {
                    return (
                      <img
                        className="cover-img-preview"
                        src={`https://image.tmdb.org/t/p/w500/${image.file_path}`}
                        alt="shows-images"
                        onClick={() =>
                          temporarySaveCoverSelection(
                            `https://image.tmdb.org/t/p/w500/${image.file_path}`
                          )
                        }
                      />
                    )
                  })
              })}
            </div>
            <div className="buttons-cover-selection">
              <button
                onClick={confirmCoverImage}
                className="cover-selection-btn save-btn"
                type="confirm"
              >
                Save
              </button>
              <button
                onClick={handleCoverSelector}
                className="cover-selection-btn cancel-btn"
                type="confirm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
