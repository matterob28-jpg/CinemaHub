import { useEffect, useState } from "react";
import { listCinemas, createCinema, updateCinema, deleteCinema } from "../../api/client.js";

const EMPTY_CINEMA = {
  name: "",
  address: "",
  city: "",
  phone: "",
  rooms: [{ name: "Room 1", capacity: 100 }],
};

// One single form gets reused for both creating and editing a cinema
export default function AdminCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingCinema, setEditingCinema] = useState(null); // null means the form is creating a new cinema instead of editing one
  const [form, setForm] = useState(EMPTY_CINEMA);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCinemas();
  }, []);

  // Fetches the full list of cinemas
  function loadCinemas() {
    setLoading(true);
    listCinemas()
      .then(setCinemas)
      .finally(() => setLoading(false));
  }

  // Loads an existing cinema into the form for editing
  function startEditing(cinema) {
    setEditingCinema(cinema);
    setForm({
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      phone: cinema.phone || "",
      rooms: cinema.rooms.map((r) => ({ name: r.name, capacity: r.capacity })),
    });
    setError(null);
    setSuccess(null);
  }

  // Resets the form back to its empty, "create new" state
  function cancelEditing() {
    setEditingCinema(null);
    setForm(EMPTY_CINEMA);
    setError(null);
  }

  // Confirmation required because the backend also cascades: deletes its screenings and cancels linked reservations, irreversible
  async function handleDelete(cinema) {
    const confirmed = window.confirm(
      "Delete \"" + cinema.name + "\"? All its screenings will also be deleted, and related bookings will be cancelled"
    );
    if (!confirmed) return;

    try {
      await deleteCinema(cinema._id);
      if (editingCinema?._id === cinema._id) cancelEditing();
      loadCinemas();
    } catch (err) {
      setError(err.response?.data?.error || "Error while deleting the cinema");
    }
  }

  // Appends one blank room row to the form
  function addRoom() {
    setForm((f) => ({
      ...f,
      rooms: [...f.rooms, { name: "Room " + (f.rooms.length + 1), capacity: 100 }],
    }));
  }

  // Removes one room row from the form by index
  function removeRoom(index) {
    setForm((f) => ({ ...f, rooms: f.rooms.filter((_, i) => i !== index) }));
  }

  // Updates one field (name or capacity) of one room row in the form
  function updateRoom(index, field, value) {
    setForm((f) => ({
      ...f,
      rooms: f.rooms.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  }

  // Creates a new cinema, or updates the one currently being edited
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (editingCinema) {
        await updateCinema(editingCinema._id, form);
        setSuccess("Cinema updated");
      } else {
        await createCinema(form);
        setSuccess("Cinema created");
      }
      cancelEditing();
      loadCinemas();
    } catch (err) {
      setError(err.response?.data?.error || "Error while saving");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-section">
      <form className="admin-section__form card" onSubmit={handleSubmit}>
        <h2>{editingCinema ? "Edit: " + editingCinema.name : "Add a new cinema"}</h2>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label htmlFor="address">Address</label>
        <input
          id="address"
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <label htmlFor="city">City</label>
        <input
          id="city"
          required
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <label>Rooms</label>
        {form.rooms.map((room, index) => (
          <div className="admin-section__row" key={index}>
            <input
              placeholder="Room name"
              value={room.name}
              onChange={(e) => updateRoom(index, "name", e.target.value)}
            />
            <input
              type="number"
              min={1}
              placeholder="Capacity"
              value={room.capacity}
              onChange={(e) => updateRoom(index, "capacity", Number(e.target.value))}
            />
            {form.rooms.length > 1 && (
              <button
                type="button"
                className="admin-section__remove"
                onClick={() => removeRoom(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn" onClick={addRoom}>
          + Add room
        </button>

        {error && <p className="admin-section__error">{error}</p>}
        {success && <p className="admin-section__success">{success}</p>}

        <div className="admin-section__row">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : editingCinema ? "Save changes" : "Create cinema"}
          </button>
          {editingCinema && (
            <button type="button" className="btn" onClick={cancelEditing}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="marquee-title" style={{ fontSize: "1.4rem", marginBottom: 12 }}>
          Existing cinemas
        </h2>
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : (
          <div className="admin-section__list">
            {cinemas.map((cinema) => (
              <div className="admin-section__item card" key={cinema._id}>
                <div>
                  <strong>{cinema.name}</strong> — {cinema.city}
                  <br />
                  <span className="eyebrow">{cinema.rooms.length} rooms</span>
                </div>
                <div className="admin-section__item-actions">
                  <button type="button" className="btn" onClick={() => startEditing(cinema)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-section__remove"
                    onClick={() => handleDelete(cinema)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
