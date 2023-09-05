import React from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import noImg from "../images/no-image.png"
import watchedGif from "../images/watched.gif"

export default function ProfileEpisodes(props) {
  const navigate = useNavigate()
  const zeroPad = (num, places) => String(num).padStart(places, "0")

  const [finished, setFinished] = React.useState(false)
  const [userWatchingTime, setUserWatchingTime] = React.useState()
  const [userTotalEpisodes, setUserTotalEpisodes] = React.useState()
  const [playGif, setPlayGif] = React.useState(false)
  const [gifSrc, setGifSrc] = React.useState()

  React.useEffect(() => {
    db.collection("users")
      .doc(props.currentUserID)
      .get()
      .then((snapshot) => {
        const userData = snapshot.data()
        setUserWatchingTime(parseInt(userData.watching_time))
        setUserTotalEpisodes(parseInt(userData.total_episodes))
      })
  }, [finished])

  function episodeMarker() {
    // const { style } = event.target

    // if (style.fill === "rgba(0, 0, 0, 0.3)") {
    //   style.fill = "rgba(63, 195, 128, 1)"

    //   setTimeout(function () {
    //     style.fill = "rgba(0, 0, 0, 0.3)"
    //   }, 200)

    addDoc(collection(db, `history-${props.currentUserID}`), {
      show_name: props.showName,
      show_id: props.showID,
      season_number: props.season_number,
      episode_number: props.episode_number,
      date_watched: serverTimestamp(),
      episode_name: props.episode_name[0],
      show_cover: props.backdrop_path[0],
      episode_time: parseInt(props.episode_time[0]),
    })

    db.collection(`watchlist-${props.currentUserID}`)
      .where("show_name", "==", props.showName)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (
            parseInt(props.curr_season_episodes) !==
            props.episode_number + 1
          ) {
            doc.ref.update({
              episode_number: props.episode_number + 1,
              status: "watching",
              date_watched: serverTimestamp(),
            })
          } else {
            if (
              props.season_number + 1 <= parseInt(props.show_all_seasons) ||
              props.show_status === "Returning Series"
            ) {
              doc.ref.update({
                season_number: props.season_number + 1,
                episode_number: 0,
                status: "watching",
                date_watched: serverTimestamp(),
              })

              setTimeout(function () {
                setFinished(false)
                props.resetSeasonData()
              }, 500)
            } else {
              doc.ref.update({
                status: "finished",
                date_watched: serverTimestamp(),
              })
            }
          }
        })
      })

    db.collection("users")
      .doc(props.currentUserID)
      .update({
        watching_time:
          parseInt(userWatchingTime) + parseInt(props.episode_time[0]),
        total_episodes: parseInt(userTotalEpisodes) + 1,
      })

    localStorage.setItem(
      "watching_time",
      parseInt(userWatchingTime) + parseInt(props.episode_time[0])
    )

    localStorage.setItem("total_episodes", parseInt(userTotalEpisodes) + 1)

    props.triggerLoadDataLocalStorage()

    setFinished(!finished)
    // } else {
    //   style.fill = "rgba(0, 0, 0, 0.3)"
    // }

    setPlayGif(true)
    // setGifSrc("https://media.giphy.com/media/XEgpdDno7WNmcod7PQ/giphy.gif")
    setTimeout(() => {
      setPlayGif(false)
      // setGifSrc(null)
    }, 1000)
  }

  function goToShow(showID) {
    fetch(
      `https://api.themoviedb.org/3/tv/${showID}?api_key=***REMOVED***&language=en-US&append_to_response=external_ids,videos,aggregate_credits,content_ratings,recommendations,similar,watch/providers,images`
    )
      .then((res) => res.json())
      .then((data) => {
        navigate("/overview", {
          state: {
            data: data,
            userId: props.currentUserID,
          },
        })
      })
  }

  function handleImageError(e) {
    // console.log("Something went wrong with your image")
    e.currentTarget.src = noImg
  }

  if (props.backdrop_path === "" || props.backdrop_path === undefined) {
    console.log("Image not loaded")
  }

  return (
    <div
      className={
        props.mobileLayout === "cards"
          ? "episode-card-wrapper"
          : "history-card-wrapper"
      }
    >
      <div
        className={
          props.mobileLayout === "cards"
            ? "profile-show-img-div"
            : "history-profile-show-img-div"
        }
      >
        {/* {playGif && (
          <img className="popcorn-gif" src={gifSrc} alt="popcorn-gif" />
        )} */}
        {props.backdrop_path[0] !== null ? (
          <div
            className={
              props.mobileLayout === "cards"
                ? "img-background"
                : "img-background grid"
            }
          >
            <img
              className={
                props.mobileLayout === "cards"
                  ? "episode-card-img"
                  : "history-card-img"
              }
              src={`https://image.tmdb.org/t/p/w500/${props.backdrop_path}`}
              alt="episode-card-img"
              loading="lazy"
              onError={(e) => handleImageError(e)}
            />
          </div>
        ) : (
          <img
            loading="lazy"
            className="show-no-img"
            src={noImg}
            alt="no-img-found"
          />
        )}

        {props.is_premiering === "true" ||
        (props.upToDate === true &&
          JSON.stringify(props.nextEpisodeDate) !== "[false]") ? (
          <h3 className="runtime-release">
            <Icon icon="fontisto:date" />
            {props.nextEpisodeDate}
          </h3>
        ) : (
          props.episode_time && (
            <h3 className="runtime-release">
              <Icon icon="entypo:time-slot" /> {props.episode_time}'
            </h3>
          )
        )}

        <p className="runtime-release premiering">
          {props.is_premiering === "true" &&
            props.is_notStarted === true &&
            "PREMIERE"}
        </p>
      </div>

      <div className="badge-info-container">
        {props.finishedShow !== true ? (
          <div
            className={
              props.mobileLayout === "cards" ? "info-card" : "info-card-grid"
            }
          >
            <h3
              style={{ cursor: "pointer" }}
              onClick={() => goToShow(props.showID)}
            >
              {props.showName}
            </h3>
            <div className="episode-num-card">
              S{zeroPad(props.season_number, 2)} | E
              {zeroPad(props.episode_number + 1, 2)}
              {props.curr_season_episodes - (props.episode_number + 1) !== 0 &&
              props.upToDate !== true ? (
                <p className="episodes-left">
                  + {props.curr_season_episodes - (props.episode_number + 1)}{" "}
                  More
                </p>
              ) : (
                <p className="episodes-left">
                  {props.upToDate !== true ? "FINALE" : "PREMIER"}
                </p>
              )}
            </div>
            <p
              className={
                props.mobileLayout === "cards"
                  ? "profile-episode-name"
                  : "profile-episode-name grid"
              }
            >
              {props.episode_name !== "false" ? props.episode_name : "TBA"}
            </p>
          </div>
        ) : (
          <div
            className={
              props.mobileLayout === "cards" ? "info-card" : "info-card-grid"
            }
          >
            <h3
              style={{ cursor: "pointer" }}
              onClick={() => goToShow(props.showID)}
            >
              {props.showName}
            </h3>
            {!props.stoppedShows ? (
              <p>Total Seasons: {props.season_number}</p>
            ) : (
              <p>Season: {props.season_number}</p>
            )}
            {!props.stoppedShows ? (
              <p>Total Episodes: {props.episode_number}</p>
            ) : (
              <p>Episode: {props.episode_number + 1}</p>
            )}
          </div>
        )}

        {props.finishedShow !== true && (
          <div>
            {props.daysUntilCurrentEpisode <= 0 ? (
              !playGif ? (
                <Icon
                  icon="icon-park-solid:check-one"
                  color="rgba(0, 0, 0, 0.3)"
                  width={45}
                  onClick={episodeMarker}
                  className="markIcon"
                />
              ) : (
                <Icon
                  icon="line-md:loading-twotone-loop"
                  width={45}
                  className="markIcon"
                />
              )
            ) : isNaN(props.daysUntilCurrentEpisode) === true ? (
              <h3 className="h3-until-episode-profile">TBA</h3>
            ) : props.daysUntilCurrentEpisode !== 1 ? (
              <h3 className="h3-until-episode-profile">{`${props.daysUntilCurrentEpisode} Days`}</h3>
            ) : (
              <h3 className="h3-until-episode-profile">{`${props.daysUntilCurrentEpisode} Day`}</h3>
            )}
          </div>
        )}
      </div>
    </div>
  )
}