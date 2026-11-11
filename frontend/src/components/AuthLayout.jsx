
import "../styles/auth.css";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">

      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <a href="/" className="auth-logo">
        <img
          src="/assets/codeyyy-logo.jpg"
          alt="Codyyy Logo"
        />
      </a>

      <main className="auth-main">
        {children}
      </main>

    </div>
  );
}

export default AuthLayout;
