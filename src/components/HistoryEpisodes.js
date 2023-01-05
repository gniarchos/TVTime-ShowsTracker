import React from "react"
import { db } from "../services/firebase"

export default function HistoryEpisodes(props) {
  const zeroPad = (num, places) => String(num).padStart(places, "0")

  function markAsUnwatched() {
    // console.log("Name:", props.history_show_name)
    // console.log("Episode:", props.history_episode_number + 1)
    // console.log("Season:", props.history_season_number)

    db.collection(`watchlist-${props.currentUserID}`)
      .where("show_name", "==", props.history_show_name)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            episode_number: props.history_episode_number,
            season_number: props.history_season_number,
          })
        })
      })
      .then(() =>
        db
          .collection(`history-${props.currentUserID}`)
          .where("show_name", "==", props.history_show_name)
          .where("season_number", "==", props.history_season_number)
          .get()
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              // console.log(doc.data().episode_number)
              if (doc.data().episode_number >= props.history_episode_number) {
                // console.log(doc.id)
                deleteEpisodeFromHistory(doc.id)
              }
            })
          })
      )

    function deleteEpisodeFromHistory(episode_to_delete) {
      db.collection(`history-${props.currentUserID}`)
        .doc(episode_to_delete)
        .delete()

      //TODO: update tv time and episodes watched
    }
  }
  return (
    <div className="history-card-wrapper">
      <div className="history-profile-show-img-div">
        <img
          className="history-card-img"
          src={`https://image.tmdb.org/t/p/w500/${props.history_cover}`}
          alt="history-episode-card-img"
        />
      </div>

      <div className="history-badge-info-container">
        <div className="history-info-card">
          <h3 style={{ cursor: "pointer" }}>{props.history_show_name}</h3>
          <p className="episode-num-card">
            S{zeroPad(props.history_season_number, 2)} | E
            {zeroPad(props.history_episode_number + 1, 2)}
          </p>
          <p className="profile-episode-name-history">
            {props.history_episode_name}
          </p>
        </div>

        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={85}
            height={85}
            viewBox="-5 -15 40 55"
          >
            <path
              style={{
                fill: "rgb(255, 99, 71)",
                width: "100%",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={markAsUnwatched}
              d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.207 12.793-1.414 1.414L12 13.414l-2.793 2.793-1.414-1.414L10.586 12 7.793 9.207l1.414-1.414L12 10.586l2.793-2.793 1.414 1.414L13.414 12l2.793 2.793z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  )
}
