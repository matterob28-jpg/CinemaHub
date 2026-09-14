import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createReservation } from "../api/client.js";
import "./BookShowtime.css";

const EMPTY_PAYMENT_FIELDS = {
  cardHolder: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

// Two-step flow (tickets then fake payment) that creates the reservation and redirects to the ticket on confirm
export default function BookShowtime({ screeningId, time }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("tickets");

  const [ticketCount, setTicketCount] = useState(1);
  const [payment, setPayment] = useState(EMPTY_PAYMENT_FIELDS);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If not logged in, redirect to login instead of opening the panel
  function handleClickTime() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setOpen((o) => !o);
  }

  // Moves from the ticket count step to the payment step
  function goToPayment(e) {
    e.preventDefault();
    setStep("payment");
  }

  // Fake payment: no card data ever reaches a real provider, this only simulates the flow
  function validatePayment() {
    if (!payment.cardHolder.trim()) return "Enter the cardholder name";
    if (!payment.cardNumber.trim()) return "Enter the card number";
    if (!payment.expiry.trim()) return "Enter the expiry date";
    if (!payment.cvv.trim()) return "Enter the CVV";

    return null;
  }

  // Validates the fake payment form and, if it passes, creates the reservation and redirects to its ticket
  async function handleConfirmPayment(e) {
    e.preventDefault();

    const validationError = validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const newReservation = await createReservation({
        screeningId,
        showtime: time,
        ticketCount,
      });
      navigate("/ticket/" + newReservation._id);
    } catch (err) {
      setError(err.response?.data?.error || "Error while booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="book-showtime">
      <button
        type="button"
        className={"showtime-pill book-showtime__button " + (open ? "is-open" : "")}
        onClick={handleClickTime}
      >
        {time}
      </button>

      {open && step === "tickets" && (
        <form className="book-showtime__panel card" onSubmit={goToPayment}>
          <label htmlFor={"tickets-" + screeningId + "-" + time}>Number of tickets</label>
          <input
            id={"tickets-" + screeningId + "-" + time}
            type="number"
            min={1}
            max={10}
            value={ticketCount}
            onChange={(e) => setTicketCount(Number(e.target.value))}
          />
          <button type="submit" className="btn btn-primary">
            Go to payment
          </button>
        </form>
      )}

      {open && step === "payment" && (
        <form className="book-showtime__panel book-showtime__panel--payment card" onSubmit={handleConfirmPayment}>
          <p className="eyebrow">Payment (simulated)</p>

          <label htmlFor={"holder-" + screeningId + "-" + time}>Cardholder</label>
          <input
            id={"holder-" + screeningId + "-" + time}
            placeholder="Mario Rossi"
            value={payment.cardHolder}
            onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })}
          />

          <label htmlFor={"number-" + screeningId + "-" + time}>Card number</label>
          <input
            id={"number-" + screeningId + "-" + time}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            maxLength={19}
            value={payment.cardNumber}
            onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
          />

          <div className="book-showtime__double-row">
            <div>
              <label htmlFor={"expiry-" + screeningId + "-" + time}>Expiry</label>
              <input
                id={"expiry-" + screeningId + "-" + time}
                placeholder="MM/YY"
                maxLength={5}
                value={payment.expiry}
                onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor={"cvv-" + screeningId + "-" + time}>CVV</label>
              <input
                id={"cvv-" + screeningId + "-" + time}
                placeholder="123"
                inputMode="numeric"
                maxLength={3}
                value={payment.cvv}
                onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="book-showtime__error">{error}</p>}

          <div className="book-showtime__double-row">
            <button type="button" className="btn" onClick={() => setStep("tickets")}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Processing..." : "Pay and book (" + ticketCount + " tix)"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
