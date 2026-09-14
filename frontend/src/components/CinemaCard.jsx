import { Link } from "react-router-dom";
import ShowtimePill from "./ShowtimePill.jsx";
import "./CinemaCard.css";

// todaysScreenings is expected already shaped by groupScreeningsByCinema
export default function CinemaCard({ cinema, todaysScreenings = [] }) {
  return (
    <Link to={"/cinema/" + cinema._id} className="cinema-card card">
      <div className="cinema-card__header">
        <h3 className="cinema-card__name marquee-title">{cinema.name}</h3>
        <span className="eyebrow">{cinema.city}</span>
      </div>
      <p className="cinema-card__address">{cinema.address}</p>

      {todaysScreenings.length > 0 ? (
        <div className="cinema-card__screenings">
          {todaysScreenings.map((screening) => (
            <div key={screening.screeningId} className="cinema-card__screening">
              <span className="cinema-card__movie-title">
                {screening.title}
                {screening.roomName && (
                  <span className="cinema-card__room"> · {screening.roomName}</span>
                )}
              </span>
              <div className="cinema-card__showtimes">
                {screening.showtimes.map((time, i) => (
                  <ShowtimePill key={time + "-" + i} time={time} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="cinema-card__no-screenings">
          No screenings scheduled for this date
        </p>
      )}
    </Link>
  );
}
