import React, { useContext, useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../services/firebase"
import { Link, useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import noImg from "../../images/no-image.png"
import "./ProfileEpisodes.css"
import { ProfileContext } from "./Profile"

export default function ProfileEpisodes(props) {
  const {
    triggerFetchUserData,
    setTriggerFetchUserData,
    playAnimation,
    setPlayAnimation,
  } = useContext(ProfileContext)

  const zeroPad = (num, places) => String(num).padStart(places, "0")

  const [finished, setFinished] = useState(false)
  const [userWatchingTime, setUserWatchingTime] = useState()
  const [userTotalEpisodes, setUserTotalEpisodes] = useState()
  const [clickedElement, setClickedElement] = useState()

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
    setClickedElement(
      `${props.show_id}-${props.season_number}-${props.episode_number}`
    )

    const addEpisodeToHistory = () => {
      return addDoc(collection(db, `history-${props.currentUserID}`), {
        show_name: props.showName,
        show_id: parseInt(props.show_id),
        season_number: props.season_number,
        episode_number: props.episode_number,
        date_watched: serverTimestamp(),
        episode_name: props.episode_name[0],
        show_cover: props.backdrop_path[0],
        episode_time: parseInt(props.episode_time[0]),
      })
    }

    const updateWatchList = async () => {
      return await db
        .collection(`watchlist-${props.currentUserID}`)
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
              } else {
                doc.ref.update({
                  status: "finished",
                  date_watched: serverTimestamp(),
                })
              }
            }
          })
        })
    }

    const updateUserStatistics = async () => {
      localStorage.setItem(
        "watching_time",
        parseInt(userWatchingTime) + parseInt(props.episode_time[0])
      )
      localStorage.setItem("total_episodes", parseInt(userTotalEpisodes) + 1)
      return await db
        .collection("users")
        .doc(props.currentUserID)
        .update({
          watching_time: userWatchingTime + parseInt(props.episode_time[0]),
          total_episodes: userTotalEpisodes + 1,
        })
    }

    Promise.all([
      addEpisodeToHistory(),
      updateWatchList(),
      updateUserStatistics(),
    ])
      .then(() => {
        setFinished(!finished)
        setTriggerFetchUserData(!triggerFetchUserData)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
  }

  function handleImageError(e) {
    e.currentTarget.src = noImg
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
        {props.backdrop_path[0] !== null ? (
          <div
            className={
              props.mobileLayout === "cards"
                ? "img-background"
                : "img-background list"
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
        (props.isInSectionUpToDate === true &&
          JSON.stringify(props.nextEpisodeDate) !== "[false]") ? (
          props.nextEpisodeDate[0] !== false ? (
            <h3 className="runtime-release upcoming">
              <Icon icon="fontisto:date" />
              {props.nextEpisodeDate}
            </h3>
          ) : (
            <h3 className="runtime-release upcoming">
              <Icon icon="fontisto:date" />
              Coming Soon
            </h3>
          )
        ) : (
          props.episode_time[0] !== 0 &&
          props.episode_time[0] !== null &&
          props.episode_time[0] !== undefined && (
            <h3 className="runtime-release">
              <Icon icon="entypo:time-slot" /> {props.episode_time}'
            </h3>
          )
        )}

        <p
          className={
            props.mobileLayout === "cards"
              ? "runtime-release premiering"
              : "runtime-release premiering list"
          }
        >
          {props.is_premiering === "true" &&
            props.is_notStarted === true &&
            "NEW SERIES"}
        </p>
      </div>

      <div className="badge-info-container">
        {props.finishedShow !== true ? (
          <div
            className={
              props.mobileLayout === "cards"
                ? !playAnimation ||
                  clickedElement !==
                    `${props.show_id}-${props.season_number}-${props.episode_number}`
                  ? "info-card"
                  : "info-card markedAnimation"
                : !playAnimation ||
                  clickedElement !==
                    `${props.show_id}-${props.season_number}-${props.episode_number}`
                ? "info-card-list"
                : "info-card-list markedAnimation"
            }
          >
            <Link
              to={`/show?show_name=${props.showName}&show_id=${props.show_id}`}
              className="show-name-profile"
            >
              {props.showName}
            </Link>
            <div className="episode-num-card">
              S{zeroPad(props.season_number, 2)} | E
              {zeroPad(props.episode_number + 1, 2)}
              {props.curr_season_episodes - (props.episode_number + 1) !== 0 &&
              props.isInSectionUpToDate !== true ? (
                props.episode_number !== 0 ? (
                  <p className="episodes-left">
                    + {props.curr_season_episodes - (props.episode_number + 1)}{" "}
                    More
                  </p>
                ) : (
                  <p className="episodes-left">PREMIERE</p>
                )
              ) : (
                <p
                  className={
                    props.nextEpisodeDate[0] === false &&
                    parseInt(props.curr_season_episodes) !==
                      parseInt(props.episode_number + 1)
                      ? "episodes-left hide"
                      : "episodes-left"
                  }
                >
                  {props.curr_season_episodes === 0 ||
                  props.isInSectionUpToDate === true
                    ? "PREMIERE"
                    : (parseInt(props.show_all_seasons) ===
                        parseInt(props.season_number) &&
                        parseInt(props.curr_season_episodes) ===
                          parseInt(props.episode_number + 1) &&
                        props.show_status === "Ended") ||
                      props.show_status === "Canceled"
                    ? "SERIES FINALE"
                    : "FINALE"}
                </p>
              )}
            </div>
            <p
              className={
                props.mobileLayout === "cards"
                  ? "profile-episode-name"
                  : "profile-episode-name list"
              }
            >
              {props.episode_name?.length > 0 &&
              (props.episode_name !== "false" || props.episode_name === "")
                ? props.episode_name
                : "TBA"}
            </p>
          </div>
        ) : (
          <div
            className={
              props.mobileLayout === "cards" ? "info-card" : "info-card-list"
            }
          >
            <Link
              to={`/show?show_name=${props.showName}&show_id=${props.showID}`}
              className="show-name-profile stopped-finished"
            >
              {props.showName}
            </Link>
            {!props.stoppedShows ? (
              <span className="profile-total-seasons-episodes">
                Total Seasons: {props.season_number}
              </span>
            ) : (
              <span className="profile-total-seasons-episodes">
                Stopped Season: {props.season_number}
              </span>
            )}
            <br />
            {!props.stoppedShows ? (
              <span className="profile-total-seasons-episodes">
                Total Episodes: {props.episode_number}
              </span>
            ) : (
              <span className="profile-total-seasons-episodes">
                Stopped Episode: {props.episode_number + 1}
              </span>
            )}
          </div>
        )}

        {props.finishedShow !== true && (
          <div>
            {props.daysUntilCurrentEpisode <= 0 ? (
              !playAnimation ||
              clickedElement !==
                `${props.show_id}-${props.season_number}-${props.episode_number}` ? (
                <Icon
                  icon="icon-park-solid:check-one"
                  color="rgba(0, 0, 0, 0.3)"
                  width={35}
                  onClick={episodeMarker}
                  className={
                    props.mobileLayout === "cards"
                      ? "markIcon"
                      : "markIcon list"
                  }
                />
              ) : (
                <Icon
                  icon="line-md:loading-twotone-loop"
                  width={35}
                  className={
                    props.mobileLayout === "cards"
                      ? "markIcon"
                      : "markIcon list"
                  }
                />
              )
            ) : isNaN(props.daysUntilCurrentEpisode) === true ? (
              <h3 className="until-episode-profile">TBA</h3>
            ) : props.daysUntilCurrentEpisode !== 1 ? (
              <h3 className="until-episode-profile">{`${props.daysUntilCurrentEpisode} Days`}</h3>
            ) : (
              <h3 className="until-episode-profile">{`${props.daysUntilCurrentEpisode} Day`}</h3>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
