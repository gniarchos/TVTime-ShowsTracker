import React from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import noImg from "../images/no-image.png"

export default function EpisodesProfile(props) {
  const navigate = useNavigate()
  const zeroPad = (num, places) => String(num).padStart(places, "0")

  const [finished, setFinished] = React.useState(false)
  const [userWatchingTime, setUserWatchingTime] = React.useState()
  const [userTotalEpisodes, setUserTotalEpisodes] = React.useState()

  React.useEffect(() => {
    db.collection("users")
      .doc(props.currentUserID)
      .get()
      .then((snapshot) =>
        setUserWatchingTime(parseInt(snapshot.data().watching_time))
      )

    db.collection("users")
      .doc(props.currentUserID)
      .get()
      .then((snapshot) =>
        setUserTotalEpisodes(parseInt(snapshot.data().total_episodes))
      )
  }, [finished])

  function episodeMarker(event) {
    const { style } = event.target

    if (style.fill === "rgba(0, 0, 0, 0.3)") {
      style.fill = "rgba(63, 195, 128, 1)"

      setTimeout(function () {
        style.fill = "rgba(0, 0, 0, 0.3)"
      }, 200)

      addDoc(collection(db, `history-${props.currentUserID}`), {
        show_name: props.showName,
        show_id: props.showID,
        season_number: props.season_number,
        episode_number: props.episode_number,
        date_watched: serverTimestamp(),
        episode_name: props.episode_name[0],
        show_cover: props.backdrop_path[0],
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
                })

                props.resetSeasonData()
              } else {
                doc.ref.update({
                  status: "finished",
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
    } else {
      style.fill = "rgba(0, 0, 0, 0.3)"
    }
  }

  function goToShow(showID) {
    fetch(
      `https://api.themoviedb.org/3/tv/${showID}?api_key=47b60aaf43a6f85780c217395976aee5&language=en-US&append_to_response=external_ids,videos,aggregate_credits,content_ratings,recommendations,similar,watch/providers,images`
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

  return (
    <div className="episode-card-wrapper">
      <div className="profile-show-img-div">
        {props.backdrop_path[0] !== null ? (
          <img
            className="episode-card-img"
            src={`https://image.tmdb.org/t/p/w500/${props.backdrop_path}`}
            alt="episode-card-img"
          />
        ) : (
          <img className="show-no-img" src={noImg} />
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
          <div className="info-card">
            <h3
              style={{ cursor: "pointer" }}
              onClick={() => goToShow(props.showID)}
            >
              {props.showName}
            </h3>
            <p className="episode-num-card">
              S{zeroPad(props.season_number, 2)} | E
              {zeroPad(props.episode_number + 1, 2)}
            </p>
            <p className="profile-episode-name">
              {props.episode_name !== "false" ? props.episode_name : "TBA"}
            </p>
          </div>
        ) : (
          <div className="info-card">
            <h3
              style={{ cursor: "pointer" }}
              onClick={() => goToShow(props.showID)}
            >
              {props.showName}
            </h3>
            <p>Total Seasons: {props.season_number}</p>
            <p>Total Episodes: {props.episode_number}</p>
          </div>
        )}

        {props.finishedShow !== true && (
          <div>
            {props.daysUntilCurrentEpisode <= 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={85}
                height={85}
                viewBox="-5 -15 40 55"
              >
                <path
                  style={{
                    fill: "rgba(0, 0, 0, 0.3)",
                    width: "100%",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={(e) => episodeMarker(e)}
                  d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.999 14.413-3.713-3.705L7.7 11.292l2.299 2.295 5.294-5.294 1.414 1.414-6.706 6.706z"
                ></path>
              </svg>
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
