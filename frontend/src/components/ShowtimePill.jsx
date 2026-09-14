import "./ShowtimePill.css";

// Small pill badge that displays one showtime string
export default function ShowtimePill({ time }) {
  return (
    <span className="showtime-pill">{time}</span>
  );
}
