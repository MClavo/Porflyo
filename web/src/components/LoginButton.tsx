const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = '/oauth/login/github';
  };

  return (
    <button onClick={handleLogin} className="btn">
      Sign in with GitHub
    </button>
  );
};

export default LoginButton;
