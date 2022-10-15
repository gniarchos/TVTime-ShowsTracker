import React from "react"
import "./ShowOverview.css"

export default function Episodes(props) {
  const zeroPad = (num, places) => String(num).padStart(places, "0")

  return (
    <div className="episodes-container">
      <div className="episode-div">
        {props.episode.still_path !== null ? (
          <img
            className="episode-img"
            src={`https://image.tmdb.org/t/p/w500/${props.episode.still_path}`}
            alt="episode-img"
          />
        ) : (
          <div style={{ width: "500px" }}></div>
        )}

        <div className="episode-info-container">
          <div className="episode-num-title">
            <p className="episode-num">
              S{zeroPad(props.seasonNum, 2)} | E{zeroPad(props.episodeNum, 2)}
            </p>
            <p>{props.episodeName}</p>
          </div>

          <div className="checked-div">
            {props.new_air_date <= props.today ? (
              <h3 className="h3-until-episode"></h3>
            ) : isNaN(props.daysUntilCurrentEpisode) === true ? (
              <h3 className="h3-until-episode">TBA</h3>
            ) : props.daysUntilCurrentEpisode !== 1 ? (
              <h3 className="h3-until-episode">{`${props.daysUntilCurrentEpisode} Days`}</h3>
            ) : (
              <h3 className="h3-until-episode">{`${props.daysUntilCurrentEpisode} Day`}</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
