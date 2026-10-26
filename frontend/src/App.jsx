import { useEffect, useState } from "react";
import {
  Link,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/feedback";

function Dashboard({ feedbackList, onEdit, onDelete, loading, error }) {
  return (
    <main>
      <h1>Feedback Dashboard</h1>

      {loading && <p>Loading feedback...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && feedbackList.length === 0 && !error && (
        <p>No feedback added yet. Use “Add Feedback” to create one.</p>
      )}

      {feedbackList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Duration</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {feedbackList.map((feedback) => (
              <tr key={feedback._id}>
                <td>{feedback.courseId}</td>
                <td>{feedback.courseName}</td>
                <td>{feedback.courseDuration}</td>
                <td>{feedback.rating} / 5</td>
                <td>{feedback.comments}</td>
                <td>
                  <button onClick={() => onEdit(feedback)}>Update</button>
                  <button onClick={() => onDelete(feedback._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function AddFeedback({ onSave, editingFeedback }) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.target);
    const feedback = Object.fromEntries(formData.entries());

    const saved = await onSave(feedback);

    if (saved) {
      navigate("/");
    } else {
      setFormError("Could not save feedback. Check that the backend is running.");
    }
  }

  return (
    <main>
      <h1>{editingFeedback ? "Update Feedback" : "Add Feedback"}</h1>

      {formError && <p role="alert">{formError}</p>}

      <form key={editingFeedback?._id || "new"} onSubmit={handleSubmit}>
        <label>
          Course ID
          <input
            name="courseId"
            defaultValue={editingFeedback?.courseId || ""}
            required
          />
        </label>

        <label>
          Course Name
          <input
            name="courseName"
            defaultValue={editingFeedback?.courseName || ""}
            required
          />
        </label>

        <label>
          Course Duration
          <input
            name="courseDuration"
            placeholder="e.g. 8 weeks"
            defaultValue={editingFeedback?.courseDuration || ""}
            required
          />
        </label>

        <label>
          Feedback Comments
          <textarea
            name="comments"
            defaultValue={editingFeedback?.comments || ""}
            required
          />
        </label>

        <label>
          Feedback Rating
          <select
            name="rating"
            defaultValue={editingFeedback?.rating || ""}
            required
          >
            <option value="" disabled>Select a rating</option>
            <option value="1">1 — Poor</option>
            <option value="2">2 — Fair</option>
            <option value="3">3 — Good</option>
            <option value="4">4 — Very good</option>
            <option value="5">5 — Excellent</option>
          </select>
        </label>

        <button type="submit">
          {editingFeedback ? "Save Changes" : "Save Feedback"}
        </button>
      </form>
    </main>
  );
}

function App() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeedback() {
      try {
        const response = await axios.get(API_URL);
        setFeedbackList(response.data);
      } catch {
        setError("Could not load feedback. Check that the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, []);

  async function saveFeedback(feedback) {
    try {
      let response;

      if (editingFeedback) {
        response = await axios.put(
          `${API_URL}/${editingFeedback._id}`,
          feedback
        );

        setFeedbackList((currentList) =>
          currentList.map((item) =>
            item._id === editingFeedback._id ? response.data : item
          )
        );
      } else {
        response = await axios.post(API_URL, feedback);
        setFeedbackList((currentList) => [response.data, ...currentList]);
      }

      setEditingFeedback(null);
      setError("");
      return true;
    } catch {
      setError("Could not save feedback.");
      return false;
    }
  }

  function editFeedback(feedback) {
    setEditingFeedback(feedback);
    navigateToAddFeedback();
  }

  async function deleteFeedback(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setFeedbackList((currentList) =>
        currentList.filter((item) => item._id !== id)
      );
      setError("");
    } catch {
      setError("Could not delete feedback.");
    }
  }

  const navigate = useNavigate();

  function navigateToAddFeedback() {
    navigate("/add-feedback");
  }

  return (
    <>
      <nav>
        <Link to="/" onClick={() => setEditingFeedback(null)}>
          Dashboard
        </Link>
        <Link
          to="/add-feedback"
          onClick={() => setEditingFeedback(null)}
        >
          Add Feedback
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              feedbackList={feedbackList}
              onEdit={editFeedback}
              onDelete={deleteFeedback}
              loading={loading}
              error={error}
            />
          }
        />

        <Route
          path="/add-feedback"
          element={
            <AddFeedback
              key={editingFeedback?._id || "new"}
              onSave={saveFeedback}
              editingFeedback={editingFeedback}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;