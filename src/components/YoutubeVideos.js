import React from "react"
import YouTube from "react-youtube"
import "./ShowOverview.css"

export default function YoutubeVideos(props) {
  const opts = {
    height: "200px",
    width: "300px",
    playerVars: {
      modestbranding: 1,
      controls: 0,
      disablekb: 1,
    },
  }

  const videos = props.data.map((videos) => {
    return videos.map((vid) => {
      return (
        <div className="videos-wrapper">
          <YouTube
            containerClassName={"youtube-container amru"}
            videoId={vid.key}
            id={vid.id}
            opts={opts}
            className="youtube-trailer"
          />
          <p>{vid.name}</p>
          <div
            onClick={() => props.changeVideo(vid.key, vid.id)}
            className="trans-video"
          ></div>
        </div>
      )
    })
  })

  return <div className="previewVideos">{videos}</div>
}
