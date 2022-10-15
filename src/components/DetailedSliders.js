import React from "react"
import "./DetailedSliders.css"
import { Icon } from "@iconify/react"
import { useNavigate, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import ReactPaginate from "react-paginate"
import noImg from "../images/no-image.png"

export default function DetailedSliders() {
  document.title = "TVTime | TV Shows Tracker"

  const location = useLocation()
  const isLoggedIn = true

  const show_title = React.useRef("")
  const navigate = useNavigate()
  const [page, setPage] = React.useState(
    localStorage.getItem("currentPage")
      ? localStorage.getItem("currentPage")
      : 1
  )
  const [allShows, setAllShows] = React.useState([])
  const [totalPages, setTotalPages] = React.useState(0)
  const [totalResults, setTotalResults] = React.useState(0)
  const [genresFilters, setGenresFilters] = React.useState()
  const [genresFiltersName, setGenresFiltersName] = React.useState("Show All")

  let allGenres = [
    "Show All",
    "Action & Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Kids",
    "Mystery",
    "News",
    "Reality",
    "Soap",
    "Talk",
    "War & Politics",
    "Western",
  ]

  React.useEffect(() => {
    fetch(`${location.state.fetchLink}${page}&with_genres=${genresFilters}`)
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        setTotalPages(data.total_pages)
        setAllShows(data.results)
        setTotalResults(data.total_results)
      })
  }, [page, location.state.fetchLink, genresFilters])

  function goToNextPage(event) {
    setPage(event.selected + 1)
    window.scrollTo(0, 0)
  }

  function goToShow(showID) {
    fetch(
      `https://api.themoviedb.org/3/tv/${showID}?api_key=47b60aaf43a6f85780c217395976aee5&language=en-US&append_to_response=external_ids,videos,aggregate_credits,content_ratings,recommendations,similar,watch/providers,images`
    )
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("currentPage", page)
        navigate("/overview", {
          state: {
            data: data,
            userId: location.state.userId,
          },
        })
      })
  }

  function handleFilters(event) {
    const { id } = event.target

    if (id === "Show All") {
      setGenresFiltersName("Show All")
      setGenresFilters("Show All")
    } else if (id === "Action & Adventure") {
      setGenresFiltersName("Action & Adventure")
      setGenresFilters(10759)
    } else if (id === "Animation") {
      setGenresFiltersName("Animation")
      setGenresFilters(16)
    } else if (id === "Comedy") {
      setGenresFiltersName("Comedy")
      setGenresFilters(35)
    } else if (id === "Crime") {
      setGenresFiltersName("Crime")
      setGenresFilters(80)
    } else if (id === "Documentary") {
      setGenresFiltersName("Documentary")
      setGenresFilters(99)
    } else if (id === "Drama") {
      setGenresFiltersName("Drama")
      setGenresFilters(18)
    } else if (id === "Family") {
      setGenresFiltersName("Family")
      setGenresFilters(10751)
    } else if (id === "Kids") {
      setGenresFiltersName("Kids")
      setGenresFilters(10762)
    } else if (id === "Mystery") {
      setGenresFiltersName("Mystery")
      setGenresFilters(9648)
    } else if (id === "News") {
      setGenresFiltersName("News")
      setGenresFilters(10763)
    } else if (id === "Reality") {
      setGenresFiltersName("Reality")
      setGenresFilters(10764)
    } else if (id === "Soap") {
      setGenresFiltersName("Soap")
      setGenresFilters(10766)
    } else if (id === "Talk") {
      setGenresFiltersName("Talk")
      setGenresFilters(10767)
    } else if (id === "War & Politics") {
      setGenresFiltersName("War & Politics")
      setGenresFilters(10768)
    } else if (id === "Western") {
      setGenresFiltersName("Western")
      setGenresFilters(37)
    }
  }

  const list = allShows.map((list, index) => {
    return (
      <div
        onClick={() => goToShow(list.id)}
        key={list.id}
        className="slider-content"
      >
        <div className="img-trend-container">
          {list.poster_path !== null ? (
            <img
              className="slider-img"
              src={`https://image.tmdb.org/t/p/w500/${list.poster_path}`}
            />
          ) : (
            <img className="slider-no-img" src={noImg} />
          )}
        </div>
        <p ref={show_title} className="slider-title">
          {list.name}
        </p>
      </div>
    )
  })

  const filtersSelection = allGenres.map((gen) => {
    return (
      <h4
        className={
          genresFiltersName === `${gen}`
            ? "filter-title active"
            : "filter-title"
        }
        id={gen}
        onClick={(e) => handleFilters(e)}
      >
        {gen}
      </h4>
    )
  })

  return (
    <>
      <div class="bg"></div>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="footer-fixer">
        <div className="detailedSlider-wrapper">
          <div className="title-link-detailed">
            <h1 className="search-title">{location.state.sectionTitle}</h1>
            <div className="search-info">
              <p>Found {totalResults} Results</p>
              <p>&#8226;</p>
              <p>Page {page}</p>
            </div>

            {allShows.length <= 0 && (
              <div>
                <p>Sorry, there are no tv shows that matched your query.</p>
              </div>
            )}

            {location.state.sectionTitle !== "Trending Now" &&
              location.state.sectionTitle !== "Search Results" && (
                <div className="search-discover-filters">
                  {filtersSelection}
                </div>
              )}
          </div>

          <div className="detailedSlider-div">{list}</div>

          <div className="pagination-container">
            <ReactPaginate
              breakLabel="..."
              nextLabel={<Icon icon="carbon:next-filled" />}
              onPageChange={(e) => goToNextPage(e)}
              pageRangeDisplayed={2}
              marginPagesDisplayed={1}
              pageCount={
                totalPages > 500 &&
                (location.state.sectionTitle === "Popular Today" ||
                  location.state.sectionTitle === "Discover")
                  ? 500
                  : totalPages
              }
              previousLabel={<Icon icon="carbon:previous-filled" />}
              renderOnZeroPageCount={null}
              containerClassName="pagination"
              pageLinkClassName="page-num"
              previousLinkClassName="page-buttons"
              nextLinkClassName="page-buttons"
              activeLinkClassName="active"
              forcePage={page - 1}
            />
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
