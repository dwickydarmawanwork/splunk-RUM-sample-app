"use client";

export default function TestErrorButton() {
  return (
    <button
      className="btn"
      onClick={() => {
        // Thrown from a timeout so it becomes an uncaught error that RUM captures.
        setTimeout(() => {
          throw new Error("Splunk RUM test error");
        }, 0);
      }}
    >
      Trigger test error
    </button>
  );
}
