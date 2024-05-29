import React from "react";

interface WaitListSignupFormProps {
  inputWidth: string;
}

function WaitListSignupForm({
  inputWidth,
}: WaitListSignupFormProps): JSX.Element {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [displayMessage, setDisplayMessage] = React.useState(false);

  // No duplicates
  // Must be a valid email
  // Must protect the form (Captcha)

  function addEmail(e: React.FormEvent): void {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    const currentDate = new Date();
    formData.append("Email", email);
    formData.append("Date", currentDate.toDateString());

    fetch(process.env.VITE_WAITLIST_GOOGLE_LINK as string, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    })
      .then(() => {
        setMessage("Thank you for signing up!");
      })
      .catch(() => {
        setMessage("An error occured.");
      })
      .finally(() => {
        setEmail("");
        setIsLoading(false);
        setDisplayMessage(true);

        // Remove message from screen automatically after 2 seconds
        setTimeout(() => {
          setDisplayMessage(false);
        }, 2000);
      });
  }

  return (
    <form onSubmit={addEmail}>
      <p className="text-sm">
        Join the wait list to be notified about Asterspark’s launch!
      </p>
      <div className={`flex ${inputWidth}`}>
        <input
          disabled={isLoading}
          name="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="border border-gray-400 border-box flex-grow px-2"
        ></input>
        <button
          disabled={isLoading}
          className={`bg-green-700 text-white px-7 py-2 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          type="submit"
        >
          Sign Up
        </button>
      </div>
      {displayMessage && (
        <span className="absolute border border-gray-400 bg-white px-2 py-1 shadow-md">
          {message}
        </span>
      )}
    </form>
  );
}

export default WaitListSignupForm;
